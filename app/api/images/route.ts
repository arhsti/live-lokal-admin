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

    const images = [];
    for (const obj of sorted) {
      if (!obj.Key) continue;
      const key = obj.Key as string;
      const filename = key.replace(prefix, '');
      const id = filename.replace(/\.[^/.]+$/, '');
      const image_url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
      // Try to fetch tags from metadata store
      images.push({ id, image_url, lastModified: obj.LastModified || null });
    }
    // Enrich with tags from metadata store (keeps tags persistent separate from R2)
    try {
      const { imageStore } = await import('@/lib/image-store');
      const metas = await imageStore.getAll();
      const metaMap = new Map(metas.map(m => [m.id, m]));

      const enriched = images.map(img => {
        const meta = metaMap.get(img.id);
        return {
          id: img.id,
          image_url: img.image_url,
          created_at: meta?.created_at || (img.lastModified ? img.lastModified.toISOString() : undefined),
          tags: meta?.tags || { player: '', number: '' },
        };
      });

      return NextResponse.json(enriched);
    } catch (err) {
      console.error('Failed to enrich images with metadata:', err);
      // Fallback: return images without tags
      return NextResponse.json(
        images.map(img => ({ id: img.id, image_url: img.image_url, tags: { player: '', number: '' } }))
      );
    }
  } catch (error) {
    console.error('Failed to list images from R2:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}