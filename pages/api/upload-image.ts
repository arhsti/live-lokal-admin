import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
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

    const mime = file.mimetype || '';
    if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/jpg') {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const buffer = await fs.readFile(file.filepath);
    const id = uuidv4();
    const extension = mime === 'image/png' ? 'png' : 'jpg';
    const key = `uploads/raw/${id}.${extension}`;
    await r2PutObject(key, buffer, mime || 'image/jpeg');

    const image_url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ id, image_url });
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
