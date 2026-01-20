import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { r2PutObject } from '@/lib/r2';
import { getEventById, updateEventStatus } from '@/lib/events';
import { listImages } from '@/lib/images';

const WEBHOOK_URL = 'https://livelokal.app.n8n.cloud/webhook-test/livelokalKlubb';

export async function triggerStoryForEvent(club: string, eventId: string, overlayPng?: Buffer) {
  const { R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_ENDPOINT, R2_PUBLIC_BASE_URL } = process.env;
  if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || (!R2_ACCOUNT_ID && !R2_ENDPOINT)) {
    throw new Error('Missing R2 configuration');
  }
  if (!overlayPng) {
    throw new Error('overlayPng is required');
  }

  const event = await getEventById(club, eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const images = await listImages(club);
  if (!images.length) {
    throw new Error('No images available');
  }

  const targetHendelse = event.hendelse.trim().toLowerCase();
  const targetDrakt = event.draktnummer.trim();
  const matches = images.filter((image) => {
    const numberMatch = (image.tags?.number || '').trim() === targetDrakt;
    const eventType = (image.tags?.eventType || '').trim().toLowerCase();
    return numberMatch && eventType === targetHendelse;
  });

  const candidates = matches.length ? matches : images;
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(selected.imageUrl);
  } catch {
    throw new Error('imageUrl is invalid');
  }

  const objectKey = parsedUrl.pathname.replace(/^\//, '');
  if (!objectKey) {
    throw new Error('Could not derive R2 object key');
  }

  if (!objectKey.startsWith(`${club}/`)) {
    throw new Error('Object key not in club scope');
  }

  if (objectKey.includes('http') || objectKey.includes('https') || objectKey.includes('://') || objectKey.includes(parsedUrl.hostname)) {
    throw new Error('Object key contains invalid URL data');
  }

  const endpoint = R2_ACCOUNT_ID
    ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : R2_ENDPOINT;
  if (!endpoint) {
    throw new Error('Missing R2 endpoint');
  }

  const r2 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const result = await r2.send(new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  }));

  if (!result.Body) {
    throw new Error('Empty R2 body');
  }

  const inputBuffer = await streamToBuffer(result.Body as Readable);

  const rendered = await sharp(inputBuffer)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();

  const renderedId = uuidv4();
  const key = `${club}/rendered/${renderedId}.jpg`;
  await r2PutObject(key, rendered, 'image/jpeg', {
    cacheControl: 'public, max-age=31536000',
    acl: 'public-read',
  });

  if (!R2_PUBLIC_BASE_URL) {
    throw new Error('R2 public base URL missing');
  }

  const imageUrl = `${R2_PUBLIC_BASE_URL}/${key}`;
  const payload = {
    imageUrl,
    hendelse: event.hendelse,
    draktnummer: event.draktnummer,
    tidspunkt: event.tidspunkt,
    source: 'admin-hendelser',
    fiksid_livelokal: club,
  };

  const webhookResponse = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    const text = await webhookResponse.text().catch(() => 'Webhook request failed');
    await updateEventStatus(club, eventId, 'failed');
    throw new Error(text || 'Webhook request failed');
  }

  await updateEventStatus(club, eventId, 'posted');
  return { imageUrl };
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
