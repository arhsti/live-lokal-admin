import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3-compatible client (works with Cloudflare R2, AWS S3, etc.)
const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'auto',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
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
  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make images publicly accessible
  });

  await s3Client.send(command);

  const baseUrl = process.env.STORAGE_PUBLIC_URL || `https://${process.env.STORAGE_BUCKET}.s3.amazonaws.com`;
  const url = `${baseUrl}/${key}`;

  return { url, key };
}

export function generateImageKey(prefix: string = 'stories'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${timestamp}-${random}.jpg`;
}