import { NextResponse } from 'next/server';
import { ImageStore } from '@/lib/images';

export async function GET() {
  try {
    const images = await ImageStore.getAll();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}