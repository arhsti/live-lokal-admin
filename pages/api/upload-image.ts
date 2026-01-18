import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import sharp from 'sharp';
import { r2PutObject } from '@/lib/r2';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { R2_BUCKET_NAME, R2_PUBLIC_BASE_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_ENDPOINT } = process.env;
    if (!R2_BUCKET_NAME || !R2_PUBLIC_BASE_URL || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || (!R2_ACCOUNT_ID && !R2_ENDPOINT)) {
      return res.status(500).json({ error: 'Missing R2 configuration' });
    }

    const form = formidable({ multiples: false });
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err: any, _fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || typeof file.filepath !== 'string') {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (file.size <= 0) {
      return res.status(400).json({ error: 'Empty file' });
    }

    const mime = (file.mimetype || '').toLowerCase();
    if (mime === 'image/svg+xml' || mime === 'image/webp' || mime === 'image/heic' || mime === 'image/heif') {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/jpg') {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const inputBuffer = await fs.readFile(file.filepath);
    const sharpPipeline = sharp(inputBuffer)
      .resize({
        width: 1080,
        height: 1920,
        fit: 'contain',
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .jpeg({ quality: 90, progressive: false, chromaSubsampling: '4:4:4' });

    const processedBuffer = (sharpPipeline as any).removeMetadata
      ? (sharpPipeline as any).removeMetadata()
      : sharpPipeline;

    const outputBuffer = await processedBuffer.toBuffer();
    const metadata = await sharp(outputBuffer).metadata();
    if (metadata.width !== 1080 || metadata.height !== 1920) {
      throw new Error('Processed image dimensions are invalid');
    }

    const id = uuidv4();
    const key = `uploads/raw/${id}.jpg`;

    await r2PutObject(key, outputBuffer, 'image/jpeg', {
      cacheControl: 'public, max-age=31536000',
      acl: 'public-read',
    });

    const imageUrl = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ imageUrl, width: 1080, height: 1920 });
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
