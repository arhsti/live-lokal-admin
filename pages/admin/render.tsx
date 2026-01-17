import { useEffect, useState } from 'react';
import Header from '../../components/Header';

interface ImageItem {
  id: string;
  image_url: string;
  tags?: { number: string; eventType?: string };
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

export default function RenderPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [results, setResults] = useState<Record<string, string | null>>({});

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      }
    } catch (_e) {
      setErrors(prev => ({ ...prev, list: 'Kunne ikke laste bilder' }));
    } finally {
      setLoading(false);
    }
  }

  async function renderStory(image: ImageItem) {
    setErrors(prev => ({ ...prev, [image.id]: null }));
    setResults(prev => ({ ...prev, [image.id]: null }));
    setRendering(prev => ({ ...prev, [image.id]: true }));

    try {
      const img = await loadImage(image.image_url);
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Kunne ikke starte canvas');

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawImageContain(ctx, img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const number = image.tags?.number || '';
      const eventType = image.tags?.eventType || 'Alle';
      const lines = [number ? `#${number}` : '', eventType].filter(Boolean);

      drawOverlayText(ctx, lines, CANVAS_WIDTH, CANVAS_HEIGHT);

      const blob = await canvasToJpeg(canvas);
      const uploaded = await uploadRendered(image.id, blob);
      setResults(prev => ({ ...prev, [image.id]: uploaded }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ukjent feil ved rendering';
      setErrors(prev => ({ ...prev, [image.id]: message }));
    } finally {
      setRendering(prev => ({ ...prev, [image.id]: false }));
    }
  }

  return (
    <div>
      <Header title="Render stories" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Render stories</h1>
          <p className="text-sm text-gray-600 mt-1">Generer ferdige story-bilder fra opplastede bilder.</p>
        </div>

        {errors.list && <div className="text-sm text-red-500">{errors.list}</div>}

        {loading ? (
          <div className="text-sm text-gray-600">Laster bilder...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="card overflow-hidden">
                <div className="bg-gray-100" style={{ height: 140 }}>
                  <img
                    src={image.image_url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-sm text-gray-700">
                    Draktnummer: {image.tags?.number || '—'}
                  </div>
                  <div className="text-sm text-gray-700">Hendelse: {image.tags?.eventType || 'Alle'}</div>
                  <button
                    className="btn-primary w-full"
                    disabled={!!rendering[image.id]}
                    onClick={() => renderStory(image)}
                  >
                    {rendering[image.id] ? 'Renderer...' : 'Render story'}
                  </button>
                  {errors[image.id] && <div className="text-sm text-red-500">{errors[image.id]}</div>}
                  {results[image.id] && (
                    <a
                      href={results[image.id] as string}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary inline-block"
                    >
                      Åpne ferdig bilde
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Kunne ikke laste bilde'));
    img.src = src;
  });
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;
  if (imgRatio > canvasRatio) {
    drawHeight = width / imgRatio;
  } else {
    drawWidth = height * imgRatio;
  }

  const dx = x + (width - drawWidth) / 2;
  const dy = y + (height - drawHeight) / 2;
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

function drawOverlayText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  width: number,
  height: number,
) {
  if (!lines.length) return;
  const maxWidth = width * 0.9;
  let fontSize = 96;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

  const fits = () => lines.every(line => {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    return ctx.measureText(line).width <= maxWidth;
  });

  while (!fits() && fontSize > 42) {
    fontSize -= 4;
  }

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const lineHeight = fontSize * 1.2;
  const totalHeight = lineHeight * lines.length;
  const startY = height * 0.68 - totalHeight / 2;

  lines.forEach((line, index) => {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(line, width / 2, startY + index * lineHeight, maxWidth);
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Kunne ikke generere JPG'));
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

async function uploadRendered(imageId: string, blob: Blob) {
  const form = new FormData();
  form.append('file', blob, `${imageId}-${Date.now()}.jpg`);
  form.append('imageId', imageId);

  const res = await fetch('/api/upload-rendered', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload feilet' }));
    throw new Error(err.error || 'Upload feilet');
  }

  const data = await res.json();
  return data.image_url as string;
}
