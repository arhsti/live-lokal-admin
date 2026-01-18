import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const getClient = () => {
  const endpoint = process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : process.env.R2_ENDPOINT;

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
};

export async function r2List(prefix: string) {
  const s3 = getClient();
  return s3.send(new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Prefix: prefix,
  }));
}

export async function r2Get(key: string) {
  const s3 = getClient();
  return s3.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
  }));
}

export async function r2Put(key: string, body: string, contentType = 'application/json') {
  const s3 = getClient();
  return s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function r2PutObject(key: string, body: Buffer | Uint8Array, contentType = 'application/octet-stream') {
  const s3 = getClient();
  return s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function r2Delete(key: string) {
  const s3 = getClient();
  return s3.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
  }));
}

export async function readBodyAsString(body: any): Promise<string> {
  if (!body) return '';
  if (typeof body === 'string') return body;
  if (typeof body.transformToString === 'function') {
    return body.transformToString();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export async function readBodyAsBuffer(body: any): Promise<Buffer> {
  if (!body) return Buffer.from('');
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
