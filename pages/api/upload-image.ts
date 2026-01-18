import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import { r2PutObject } from '@/lib/r2';
import { registerRenderedImage } from '@/lib/images';

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
        resolve({ files, fields });
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
    const extension = mime === 'image/png' ? 'png' : 'jpg';

    const typeField = typeof fields.type === 'string' ? fields.type : Array.isArray(fields.type) ? fields.type[0] : null;
    const sourceImageId = typeof fields.sourceImageId === 'string'
      ? fields.sourceImageId
      : Array.isArray(fields.sourceImageId)
        ? fields.sourceImageId[0]
        : null;

    const isRendered = typeField === 'rendered';
    if (isRendered && !sourceImageId) {
      return res.status(400).json({ error: 'Missing source image id' });
    }

    const id = isRendered ? `${sourceImageId}-${Date.now()}` : uuidv4();
    const key = isRendered
      ? `uploads/rendered/${id}.${extension}`
      : `uploads/raw/${id}.${extension}`;

    await r2PutObject(key, buffer, mime || 'image/jpeg', {
      cacheControl: 'public, max-age=31536000',
      acl: 'public-read',
    });

    if (isRendered && sourceImageId) {
      await registerRenderedImage(id, sourceImageId);
    }

    const image_url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return res.status(200).json({ id, image_url });
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
