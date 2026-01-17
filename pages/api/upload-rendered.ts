import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import formidable from 'formidable';
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
    const { files, fields } = await new Promise<{ files: any; fields: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || typeof file.filepath !== 'string') {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (file.size <= 0) {
      return res.status(400).json({ error: 'Empty file' });
    }

    const buffer = await fs.readFile(file.filepath);
    const imageId = typeof fields.imageId === 'string' ? fields.imageId : Array.isArray(fields.imageId) ? fields.imageId[0] : 'image';
    const timestamp = Date.now();
    const key = `rendered/${imageId}-${timestamp}.jpg`;

    await r2PutObject(key, buffer, file.mimetype || 'image/jpeg');

    const image_url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ key, image_url });
  } catch (error) {
    return res.status(500).json({ error: 'Upload failed' });
  }
}
