import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { r2Get, r2PutObject, readBodyAsBuffer } from '@/lib/r2';

const WIDTH = 1080;
const HEIGHT = 1920;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { R2_BUCKET_NAME, R2_PUBLIC_BASE_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_ENDPOINT } = process.env;
    if (!R2_BUCKET_NAME || !R2_PUBLIC_BASE_URL || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || (!R2_ACCOUNT_ID && !R2_ENDPOINT)) {
      return res.status(500).json({ success: false, error: 'Missing R2 configuration' });
    }

    const { imageUrl, text } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'imageUrl is required' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return res.status(400).json({ success: false, error: 'imageUrl is invalid' });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ success: false, error: 'imageUrl must be http or https' });
    }

    let baseUrl: URL;
    try {
      baseUrl = new URL(R2_PUBLIC_BASE_URL);
    } catch {
      return res.status(500).json({ success: false, error: 'R2 public base URL is invalid' });
    }

    if (parsedUrl.origin !== baseUrl.origin) {
      return res.status(400).json({ success: false, error: 'imageUrl must match public R2 base URL' });
    }

    const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
    const rawPath = parsedUrl.pathname.startsWith(basePath)
      ? parsedUrl.pathname.slice(basePath.length)
      : parsedUrl.pathname.replace(/^\//, '');

    if (!rawPath) {
      return res.status(400).json({ success: false, error: 'Could not derive R2 object key' });
    }

    const obj = await r2Get(rawPath);
    const inputBuffer = await readBodyAsBuffer(obj.Body);
    if (!inputBuffer.length) {
      return res.status(400).json({ success: false, error: 'Image buffer is empty' });
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

    const image_url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ success: true, url: image_url });
  } catch (error) {
    console.error('Render failed:', error);
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
