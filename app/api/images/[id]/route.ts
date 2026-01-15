import { NextRequest, NextResponse } from 'next/server';
import type { ImageTags } from '@/lib/image-store';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = context?.params;
    const id = params?.id || (params && (await params).id);
    const body = await request.json();
    const { player, number, eventType } = body || {};

    const allowed = ['Mål', 'Kort', 'Bytte', 'Alle'];
    if (typeof player !== 'string' || typeof number !== 'string' || typeof eventType !== 'string' || !allowed.includes(eventType)) {
      return NextResponse.json({ error: 'player, number and valid eventType are required' }, { status: 400 });
    }

    const { imageStore } = await import('@/lib/image-store');
    const tags = { player, number, eventType } as ImageTags;
    const meta = await imageStore.upsertTags(id, tags);

    return NextResponse.json({ id: meta.id, tags: meta.tags, created_at: meta.created_at });
  } catch (err) {
    console.error('Failed to update image tags:', err);
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
  }
}
