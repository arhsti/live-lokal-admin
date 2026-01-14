export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('No file provided in formData');
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Some runtimes may not have a global File constructor; be defensive
    const isFile = (typeof File !== 'undefined' && file instanceof File) || (file && typeof (file as any).arrayBuffer === 'function');
    if (!isFile) {
      console.error('Uploaded part is not a File:', typeof file);
      return new Response(JSON.stringify({ error: 'Invalid file upload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const f = file as File;
    if (typeof f.size !== 'number' || f.size <= 0) {
      console.error('Empty file uploaded');
      return new Response(JSON.stringify({ error: 'Empty file' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (f.type !== 'image/jpeg' && f.type !== 'image/png') {
      console.error('Unsupported file type:', f.type);
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const buffer = Buffer.from(await f.arrayBuffer());
    const id = uuidv4();
    const key = `uploads/raw/${id}.jpg`;

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
      ContentType: f.type,
    });

    await s3.send(put);

    const image_url = `${process.env.R2_PUBLIC_BASE_URL}/uploads/raw/${id}.jpg`;

    return new Response(JSON.stringify({ id, image_url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Upload failed:', err);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
