import sharp from 'sharp';

export interface RenderOptions {
  backgroundImage?: Buffer;
  text: string;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  x?: number;
  y?: number;
}

export async function renderStoryImage(options: RenderOptions): Promise<Buffer> {
  const {
    backgroundImage,
    text,
    width = 1080,
    height = 1920,
    fontSize = 48,
    fontFamily = 'Arial',
    textColor = '#ffffff',
    textAlign = 'center',
    x = width / 2,
    y = height / 2,
  } = options;

  // Create SVG overlay for text
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .text {
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            fill: ${textColor};
            text-anchor: ${textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'};
            dominant-baseline: middle;
          }
        </style>
      </defs>
      <text x="${x}" y="${y}" class="text">${escapeXml(text)}</text>
    </svg>
  `;

  // Start with background image or create a gradient background
  let pipeline = backgroundImage
    ? sharp(backgroundImage).resize(width, height, { fit: 'cover' })
    : sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background as placeholder
        },
      });

  // Composite the SVG text overlay
  pipeline = pipeline.composite([
    {
      input: Buffer.from(svgText),
      top: 0,
      left: 0,
    },
  ]);

  // Convert to JPEG
  const buffer = await pipeline.jpeg({ quality: 90 }).toBuffer();

  return buffer;
}

// Helper function to escape XML characters in text
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// TODO: Implement background image selection logic
export async function selectBackgroundImage(templateId?: string): Promise<Buffer | undefined> {
  // TODO: Load background image from storage or database based on templateId
  // For now, return undefined to use default gradient
  return undefined;
}