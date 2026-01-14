import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, generateImageKey } from '@/lib/storage';
import { imageStore } from '@/lib/image-store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique key for R2 storage
    const key = generateImageKey('uploads');

    // Upload to R2
    const uploadResult = await uploadImage(buffer, key, file.type);

    // Persist metadata
    const imageData = await imageStore.add({
      id: uuidv4(),
      image_url: uploadResult.url,
    });

    return NextResponse.json({
      id: imageData.id,
      image_url: imageData.image_url,
      created_at: imageData.created_at,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
