import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import sharp from 'sharp';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { r2PutObject } from '@/lib/r2';
import { getEventById } from '@/lib/events';
import { listImages } from '@/lib/images';

const WEBHOOK_URL = 'https://livelokal.app.n8n.cloud/webhook-test/livelokalKlubb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_ENDPOINT, R2_PUBLIC_BASE_URL } = process.env;
    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || (!R2_ACCOUNT_ID && !R2_ENDPOINT)) {
      throw new Error('Missing R2 configuration');
    }

    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const eventId = typeof fields.eventId === 'string'
      ? fields.eventId
      : Array.isArray(fields.eventId)
        ? fields.eventId[0]
        : null;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required' });
    }

    const overlayFile = Array.isArray(files.overlayPng) ? files.overlayPng[0] : files.overlayPng;
    if (!overlayFile || typeof overlayFile.filepath !== 'string') {
      return res.status(400).json({ success: false, error: 'overlayPng is required' });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const images = await listImages();
    if (!images.length) {
      return res.status(400).json({ success: false, error: 'No images available' });
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

    const bodyStream = result.Body as Readable;
    const inputBuffer = await streamToBuffer(bodyStream);

    const overlayBuffer = await fs.readFile(overlayFile.filepath);
    const rendered = await sharp(inputBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const renderedId = uuidv4();
    const key = `uploads/rendered-events/${renderedId}.jpg`;
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
    };

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const text = await webhookResponse.text().catch(() => 'Webhook request failed');
      return res.status(400).json({ success: false, error: text || 'Webhook request failed' });
    }

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Render failed';
    return res.status(500).json({ success: false, error: message });
  }
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
