import { NextResponse } from 'next/server';
import { imageStore } from '@/lib/image-store';

export async function GET() {
  try {
    const images = await imageStore.getAll();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}