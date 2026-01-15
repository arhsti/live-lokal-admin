import { NextRequest, NextResponse } from 'next/server';
import type { ImageTags } from '@/lib/image-store';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = context?.params;
    const id = params?.id || (params && (await params).id);
    const body = await request.json();
    const { number, eventType } = body || {};

    const allowed = ['Mål', 'Kort', 'Bytte', 'Alle'];
    if (typeof eventType !== 'string' || !allowed.includes(eventType)) {
      return NextResponse.json({ error: 'valid eventType is required' }, { status: 400 });
    }

    // Validate draktnummer: must be numeric between 1 and 99
    const parsed = parseInt(String(number ?? ''), 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 99) {
      return NextResponse.json({ error: 'number must be an integer between 1 and 99' }, { status: 400 });
    }

    const numberStr = String(parsed);

    const { imageStore } = await import('@/lib/image-store');
    const tags = { number: numberStr, eventType } as ImageTags;
    const meta = await imageStore.upsertTags(id, tags);

    return NextResponse.json({ id: meta.id, tags: meta.tags, created_at: meta.created_at });
  } catch (err) {
    console.error('Failed to update image tags:', err);
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
  }
}
