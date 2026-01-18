import type { NextApiRequest, NextApiResponse } from 'next';
import type { Readable } from 'stream';
import sharp from 'sharp';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { r2PutObject } from '@/lib/r2';

const WIDTH = 1080;
const HEIGHT = 1920;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_ENDPOINT } = process.env;
    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || (!R2_ACCOUNT_ID && !R2_ENDPOINT)) {
      throw new Error('Missing R2 configuration');
    }

    const { imageUrl, text } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('imageUrl is required');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
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

    if (!inputBuffer.length) {
      throw new Error('Image buffer is empty');
    }

    const headerSnippet = inputBuffer.slice(0, 200).toString('utf8').trimStart().toLowerCase();
    if (headerSnippet.startsWith('<svg') || headerSnippet.startsWith('<html')) {
      throw new Error('Image buffer contains SVG/HTML content');
    }

    const baseImage = await sharp(inputBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
      .toBuffer();

    const overlayText = typeof text === 'string' ? text.trim() : '';
    const svg = overlayText ? buildTextSvg(overlayText) : null;

    const rendered = svg
      ? await sharp(baseImage)
        .composite([{ input: Buffer.from(svg) }])
        .jpeg({ quality: 92 })
        .toBuffer()
      : await sharp(baseImage).jpeg({ quality: 92 }).toBuffer();

    const key = `uploads/rendered/${Date.now()}.jpg`;
    await r2PutObject(key, rendered, 'image/jpeg');

    const image_url = `${parsedUrl.origin}/${key}`;
    return res.status(200).json({ success: true, url: image_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Render failed';
    return res.status(500).json({ success: false, error: message });
  }
}

function buildTextSvg(text: string) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  const fontSize = lines.length <= 1 ? 96 : lines.length === 2 ? 72 : 60;
  const lineHeight = Math.round(fontSize * 1.2);
  const totalHeight = lineHeight * lines.length;
  const startY = HEIGHT / 2 - totalHeight / 2 + lineHeight / 2;

  const tspans = lines.map((line, index) => {
    const dy = index === 0 ? 0 : lineHeight;
    return `<tspan x="${WIDTH / 2}" dy="${dy}">${escapeXml(line)}</tspan>`;
  }).join('');

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.5)" />
        </filter>
      </defs>
      <text
        x="${WIDTH / 2}"
        y="${startY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        font-weight="700"
        fill="#ffffff"
        filter="url(#shadow)"
      >
        ${tspans}
      </text>
    </svg>
  `;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
