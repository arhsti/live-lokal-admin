import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from '@/lib/storage';
import { requireAuth, getUser } from '@/lib/auth';

export const runtime = 'nodejs';

// Image metadata interface
interface ImageMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  tags?: string[];
  category?: string;
  status: 'active' | 'processing' | 'error';
  storageKey: string;
  publicUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    // TODO: Enable authentication when ready
    // await requireAuth(request);
    const user = await getUser(); // Placeholder user

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const imageId = uuidv4();

    // Parse tags (comma-separated string to array)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate storage key
    const storageKey = `uploads/raw/${imageId}.jpg`;

    // Upload to object storage
    const uploadResult = await uploadImage(buffer, storageKey, file.type);

    // Create metadata
    const metadata: ImageMetadata = {
      id: imageId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.id,
      tags: tagsArray,
      category: category || undefined,
      status: 'active',
      storageKey,
      publicUrl: uploadResult.url,
    };

    // TODO: Store metadata in database
    // await saveImageMetadata(metadata);

    console.log('Image uploaded successfully:', metadata);

    return NextResponse.json({
      id: metadata.id,
      image_url: metadata.publicUrl,
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// TODO: Implement database storage
// async function saveImageMetadata(metadata: ImageMetadata): Promise<void> {
//   // Placeholder for database storage
//   // This could be MongoDB, PostgreSQL, or any database
//   console.log('Saving metadata to database:', metadata);
// }