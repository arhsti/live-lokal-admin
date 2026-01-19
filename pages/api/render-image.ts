import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import sharp from 'sharp';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { r2PutObject } from '@/lib/r2';


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

    const imageUrl = typeof fields.imageUrl === 'string'
      ? fields.imageUrl
      : Array.isArray(fields.imageUrl)
        ? fields.imageUrl[0]
        : null;

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    const overlayFile = Array.isArray(files.overlayPng) ? files.overlayPng[0] : files.overlayPng;
    if (!overlayFile || typeof overlayFile.filepath !== 'string') {
      throw new Error('overlayPng is required');
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

    const overlayBuffer = await fs.readFile(overlayFile.filepath);
    const baseImage = inputBuffer;

    const rendered = await sharp(baseImage)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
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

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
