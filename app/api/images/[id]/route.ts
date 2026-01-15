import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = context?.params;
    const id = params?.id || (params && (await params).id);
    const body = await request.json();
    const { player, number } = body || {};

    if (typeof player !== 'string' || typeof number !== 'string') {
      return NextResponse.json({ error: 'player and number are required' }, { status: 400 });
    }

    const { imageStore } = await import('@/lib/image-store');
    const meta = await imageStore.upsertTags(id, { player, number });

    return NextResponse.json({ id: meta.id, tags: meta.tags, created_at: meta.created_at });
  } catch (err) {
    console.error('Failed to update image tags:', err);
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
  }
}
