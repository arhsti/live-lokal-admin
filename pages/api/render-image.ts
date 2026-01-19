import type { NextApiRequest, NextApiResponse } from 'next';
import type { Readable } from 'stream';
import { readFileSync } from 'fs';
import { createCanvas, registerFont } from 'canvas';
import sharp from 'sharp';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { r2PutObject } from '@/lib/r2';

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_PATH = 'assets/fonts/Noto_Sans/static/NotoSans-Bold.ttf';
ensureFontLoaded(FONT_PATH);

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

    const { imageUrl, hendelse, tidspunkt } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('imageUrl is required');
    }
    if (!hendelse || typeof hendelse !== 'string' || !hendelse.trim()) {
      throw new Error('hendelse is required');
    }
    if (!tidspunkt || typeof tidspunkt !== 'string' || !tidspunkt.trim()) {
      throw new Error('tidspunkt is required');
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

    const baseImage = inputBuffer;
    const textOverlay = createTextOverlay(hendelse.trim(), tidspunkt.trim());

    const rendered = await sharp(baseImage)
      .composite([{ input: textOverlay, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer();

    const key = `uploads/rendered/${Date.now()}.jpg`;
    await r2PutObject(key, rendered, 'image/jpeg', {
      cacheControl: 'public, max-age=31536000',
      acl: 'public-read',
    });

    if (!R2_PUBLIC_BASE_URL) {
      throw new Error('R2 public base URL missing');
    }
    const image_url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ success: true, url: image_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Render failed';
    return res.status(500).json({ success: false, error: message });
  }
}

function buildTextSvg(hendelse: string, tidspunkt: string) {
  const fontFamily = 'NotoSans';
  const baseY = Math.round(HEIGHT * 0.8);
  const hendelseSize = 104;
  const tidspunktSize = 60;
  const lineGap = 16;
  const safeHendelse = escapeXml(hendelse);
  const safeTidspunkt = escapeXml(tidspunkt);
  const hendelseY = baseY;
  const tidspunktY = baseY + hendelseSize + lineGap;

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'NotoSans';
          src: url('data:font/ttf;base64,${FONT_REGULAR_BASE64}') format('truetype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'NotoSans';
          src: url('data:font/ttf;base64,${FONT_BOLD_BASE64}') format('truetype');
          font-weight: 700;
        }
        .event {
          font-size: ${hendelseSize}px;
          font-weight: 700;
          fill: #ffffff;
          stroke: #000000;
          stroke-width: 4px;
          paint-order: stroke fill;
          font-family: ${fontFamily};
        }
        .time {
          font-size: ${tidspunktSize}px;
          font-weight: 400;
          fill: #ffffff;
          stroke: #000000;
          stroke-width: 3px;
          paint-order: stroke fill;
          font-family: ${fontFamily};
        }
      </style>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.6)" />
        </filter>
      </defs>
      <text
        x="${WIDTH / 2}"
        y="${hendelseY}"
        text-anchor="middle"
        dominant-baseline="middle"
        filter="url(#shadow)"
        class="event"
      >${safeHendelse}</text>
      <text
        x="${WIDTH / 2}"
        y="${tidspunktY}"
        text-anchor="middle"
        dominant-baseline="middle"
        filter="url(#shadow)"
        class="time"
      >${safeTidspunkt}</text>
    </svg>
  `;
}

function createTextOverlay(hendelse: string, tidspunkt: string) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';

  const baseY = Math.round(HEIGHT * 0.8);
  const hendelseY = baseY;
  const tidspunktY = baseY + 70;

  ctx.lineWidth = 4;
  ctx.font = 'bold 96px NotoSans';
  ctx.strokeText(hendelse, WIDTH / 2, hendelseY);
  ctx.fillText(hendelse, WIDTH / 2, hendelseY);

  ctx.lineWidth = 3;
  ctx.font = 'bold 56px NotoSans';
  ctx.strokeText(tidspunkt, WIDTH / 2, tidspunktY);
  ctx.fillText(tidspunkt, WIDTH / 2, tidspunktY);

  return canvas.toBuffer('image/png');
}

function ensureFontLoaded(path: string) {
  try {
    readFileSync(path);
    registerFont(path, { family: 'NotoSans', weight: 'bold' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load font at ${path}: ${message}`);
  }
}
