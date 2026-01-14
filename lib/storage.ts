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
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make images publicly accessible
  });

  await s3Client.send(command);

  // Build public URL using R2 public base URL
  const url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

  return { url, key };
}

export function generateImageKey(prefix: string = 'stories'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${timestamp}-${random}.jpg`;
}
