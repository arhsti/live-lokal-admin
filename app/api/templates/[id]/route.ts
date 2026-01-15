import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

async function getTemplateById(id: string) {
  const s3 = getR2Client();
  const key = `${TEMPLATE_PREFIX}${id}.json`;
  try {
    const obj = await s3.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: key,
    }));
    const raw = await readBodyAsString(obj.Body);
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      text_boxes: normalizeTextBoxes(parsed?.text_boxes || []),
    };
  } catch (error) {
    return null;
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const template = await getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error('Template get error:', error);
    return NextResponse.json({ error: 'Failed to load template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, image_id, image_url, text_boxes } = body || {};

    if (!name || !image_id || !image_url || !Array.isArray(text_boxes)) {
      return NextResponse.json({ error: 'Invalid template payload' }, { status: 400 });
    }

    const existing = await getTemplateById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

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
    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const existing = await getTemplateById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const s3 = getR2Client();
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: `${TEMPLATE_PREFIX}${id}.json`,
    }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
