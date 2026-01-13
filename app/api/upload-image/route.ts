import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, generateImageKey } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // TODO: Enable authentication when ready
    // await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique key and upload
    const imageKey = generateImageKey('uploads');
    const uploadResult = await uploadImage(buffer, imageKey, file.type);

    return NextResponse.json({
      image_url: uploadResult.url,
      success: true,
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}