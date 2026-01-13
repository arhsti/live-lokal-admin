import { NextRequest, NextResponse } from 'next/server';
import { renderStoryImage, selectBackgroundImage } from '@/lib/render';
import { uploadImage, generateImageKey } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

interface RenderStoryRequest {
  text: string;
  templateId?: string;
  // TODO: Add more dynamic fields as needed
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Enable authentication when ready
    // await requireAuth(request);

    const body: RenderStoryRequest = await request.json();
    const { text, templateId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text field is required' },
        { status: 400 }
      );
    }

    // Select background image (placeholder logic)
    const backgroundImage = await selectBackgroundImage(templateId);

    // Render the story image
    const imageBuffer = await renderStoryImage({
      backgroundImage,
      text,
      width: 1080,
      height: 1920,
      fontSize: 64,
      textColor: '#ffffff',
      textAlign: 'center',
    });

    // Generate unique key and upload to storage
    const imageKey = generateImageKey('stories');
    const uploadResult = await uploadImage(imageBuffer, imageKey, 'image/jpeg');

    return NextResponse.json({
      image_url: uploadResult.url,
      success: true,
    });

  } catch (error) {
    console.error('Error rendering story:', error);
    return NextResponse.json(
      { error: 'Failed to render story image' },
      { status: 500 }
    );
  }
}