import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { requireAuth, getUser } from '@/lib/auth';

export const runtime = 'nodejs';

// Template data models
interface TextBlock {
  key: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

interface Template {
  id: string;
  name: string;
  canvas: {
    width: number;
    height: number;
  };
  textBlocks: TextBlock[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  status: 'active' | 'draft' | 'archived';
}

// Zod validation schema for template creation
const TextBlockSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  x: z.number().min(0, 'X coordinate must be non-negative'),
  y: z.number().min(0, 'Y coordinate must be non-negative'),
  maxWidth: z.number().min(1, 'Max width must be positive'),
  fontSize: z.number().min(8, 'Font size must be at least 8').max(200, 'Font size must be at most 200'),
  fontWeight: z.number().min(100, 'Font weight must be at least 100').max(900, 'Font weight must be at most 900'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FFFFFF)'),
  align: z.enum(['left', 'center', 'right']),
});

const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name must be 100 characters or less'),
  textBlocks: z.array(TextBlockSchema).min(1, 'At least one text block is required').max(10, 'Maximum 10 text blocks allowed'),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (admin/editor role required)
    // TODO: Enable authentication and role checking
    // await requireAuth(request, ['admin', 'editor']);
    const user = await getUser(); // Placeholder user

    const body = await request.json();

    // Validate input data
    const validationResult = CreateTemplateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, textBlocks } = validationResult.data;

    // Generate unique ID
    const templateId = uuidv4();

    // Create template object
    const template: Template = {
      id: templateId,
      name,
      canvas: {
        width: 1080, // Instagram Story dimensions
        height: 1920,
      },
      textBlocks,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      status: 'active',
    };

    // TODO: Store template in database
    // await saveTemplate(template);

    console.log('Template created successfully:', template);

    return NextResponse.json({
      id: template.id,
      message: 'Template created successfully',
    });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// TODO: Implement GET endpoint for retrieving templates
// export async function GET(request: NextRequest) {
//   try {
//     // TODO: Enable authentication when ready
//     // await requireAuth(request);

//     // TODO: Retrieve templates from database
//     // const templates = await getTemplates();

//     return NextResponse.json({
//       templates: [],
//       message: 'Templates retrieved successfully',
//     });
//   } catch (error) {
//     console.error('Error retrieving templates:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve templates' },
//       { status: 500 }
//     );
//   }
// }

// TODO: Implement database operations
// async function saveTemplate(template: Template): Promise<void> {
//   // Placeholder for database storage
//   // This could be MongoDB, PostgreSQL, or any database
//   console.log('Saving template to database:', template);
// }

// async function getTemplates(): Promise<Template[]> {
//   // Placeholder for database retrieval
//   // Return array of templates
//   return [];
// }