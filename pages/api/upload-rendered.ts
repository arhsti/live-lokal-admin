import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import formidable from 'formidable';

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

    const buffer = await fs.readFile(file.filepath);
    const key = `rendered/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    const put = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: key,
      Body: buffer,
      ContentType: file.mimetype || 'image/jpeg',
    });

    await s3.send(put);
    const image_url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ key, image_url });
  } catch (error) {
    console.error('Render upload failed:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
