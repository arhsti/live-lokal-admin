import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 S3-compatible client
const s3Client = new S3Client({
  region: 'auto', // R2 requires 'auto' region
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadImage(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // ACL not needed for R2 - permissions are handled at bucket level
    });

    console.log('R2 Upload:', {
      bucket: process.env.R2_BUCKET_NAME,
      key,
      contentType,
      size: buffer.length
    });

    await s3Client.send(command);

    // Build public URL using R2 public base URL
    const url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

    console.log('R2 Upload successful:', { key, url });

    return { url, key };
  } catch (error) {
    console.error('R2 Upload failed:', error);
    throw error;
  }
}

export function generateImageKey(prefix: string = 'stories'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${timestamp}-${random}.jpg`;
}