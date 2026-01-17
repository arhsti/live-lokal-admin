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

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const buffer = await fs.readFile(file.filepath);
    const id = uuidv4();
    const extension = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const key = `uploads/raw/${id}.${extension}`;
    await r2PutObject(key, buffer, file.mimetype || 'image/jpeg');

    const image_url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ id, image_url });
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
