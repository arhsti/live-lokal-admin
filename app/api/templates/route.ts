import { NextRequest, NextResponse } from 'next/server';
import { templateStore } from '@/lib/template-store';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const templates = await templateStore.getAll();
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

    const created = await templateStore.create({
      name,
      image_id,
      image_url,
      text_boxes,
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Template create error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}