import { NextRequest, NextResponse } from 'next/server';
import { templateStore } from '@/lib/template-store';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const template = await templateStore.getById(id);
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

    const updated = await templateStore.update(id, {
      name,
      image_id,
      image_url,
      text_boxes,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const removed = await templateStore.delete(id);
    if (!removed) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
