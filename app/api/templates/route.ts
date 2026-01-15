import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const TEMPLATE_PREFIX = 'templates/';

const getR2Client = () => new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

async function readBodyAsString(body: any): Promise<string> {
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

function normalizeTextBoxes(text_boxes: any[]) {
  if (!Array.isArray(text_boxes)) return [];
  return text_boxes.map((box) => {
    const textAlign = box?.textAlign ?? box?.alignment ?? 'left';
    return {
      id: String(box?.id || ''),
      x: Number(box?.x || 0),
      y: Number(box?.y || 0),
      width: Number(box?.width || 0),
      height: Number(box?.height || 0),
      fontSize: Number(box?.fontSize || 16),
      textAlign,
      alignment: textAlign,
      placeholderKey: String(box?.placeholderKey || ''),
    };
  });
}

export async function GET() {
  try {
    const s3 = getR2Client();
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Prefix: TEMPLATE_PREFIX,
    }));

    const items = (list.Contents || [])
      .filter(obj => obj.Key)
      .sort((a, b) => {
        const at = a.LastModified ? a.LastModified.getTime() : 0;
        const bt = b.LastModified ? b.LastModified.getTime() : 0;
        return bt - at;
      });

    const templates = [] as any[];
    for (const item of items) {
      const key = item.Key as string;
      if (!key.startsWith(TEMPLATE_PREFIX)) continue;
      const obj = await s3.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Key: key,
      }));
      const raw = await readBodyAsString(obj.Body);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        templates.push({
          ...parsed,
          text_boxes: normalizeTextBoxes(parsed?.text_boxes || []),
        });
      } catch (e) {
        console.error('Failed to parse template JSON:', key, e);
      }
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Template list error:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image_id, image_url, text_boxes } = body || {};

    if (!name || !image_id || !image_url || !Array.isArray(text_boxes)) {
      return NextResponse.json({ error: 'Invalid template payload' }, { status: 400 });
    }

    const id = `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const template = {
      id,
      name,
      image_id,
      image_url,
      text_boxes: normalizeTextBoxes(text_boxes),
    };

    const s3 = getR2Client();
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: `${TEMPLATE_PREFIX}${id}.json`,
      Body: JSON.stringify(template, null, 2),
      ContentType: 'application/json',
    }));

    return NextResponse.json(template);
  } catch (error) {
    console.error('Template create error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}