import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    const prefix = 'uploads/raw/';
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Prefix: prefix,
    });

    const result = await s3.send(command);
    const items = result.Contents || [];

    // Sort by LastModified descending (newest first) when available
    const sorted = items.slice().sort((a, b) => {
      const at = a.LastModified ? a.LastModified.getTime() : 0;
      const bt = b.LastModified ? b.LastModified.getTime() : 0;
      return bt - at;
    });

    const images = sorted
      .filter(obj => obj.Key)
      .map(obj => {
        const key = obj.Key as string;
        // id = filename without prefix and extension
        const filename = key.replace(prefix, '');
        const id = filename.replace(/\.[^/.]+$/, '');
        const image_url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
        return { id, image_url };
      });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to list images from R2:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}