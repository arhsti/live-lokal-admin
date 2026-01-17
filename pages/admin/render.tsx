import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

interface ImageItem {
  id: string;
  image_url: string;
  tags?: { number: string; eventType?: string };
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

export default function RenderPage() {
  const router = useRouter();
  const imageId = useMemo(() => {
    if (!router.isReady) return null;
    const value = router.query.imageId;
    return Array.isArray(value) ? value[0] : value || null;
  }, [router.isReady, router.query.imageId]);

  const [allImages, setAllImages] = useState<ImageItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [image, setImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadImageList();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSelectedId(imageId);
    if (!imageId) {
      setImage(null);
      setLoading(false);
      return;
    }

    loadImageById(imageId);
  }, [router.isReady, imageId]);

  async function loadImageList() {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/images');
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Kunne ikke laste bilder' }));
        setListError(err.error || 'Kunne ikke laste bilder');
        return;
      }
      const data = await res.json();
      setAllImages(Array.isArray(data) ? data : []);
    } catch (_e) {
      setListError('Kunne ikke laste bilder');
    } finally {
      setListLoading(false);
    }
  }

  async function loadImageById(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/images?imageId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Fant ikke bildet' }));
        setError(err.error || 'Fant ikke bildet');
        setImage(null);
        return;
      }
      const data = await res.json();
      setImage(data);
    } catch (_e) {
      setError('Kunne ikke laste bildet');
      setImage(null);
    } finally {
      setLoading(false);
    }
  }

  async function renderStory() {
    if (!image) return;
    setError(null);
    setResult(null);
    setRendering(true);

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

      const lines = [title.trim(), body.trim()].filter(Boolean);
      drawOverlayText(ctx, lines, CANVAS_WIDTH, CANVAS_HEIGHT);

      const blob = await canvasToJpeg(canvas);
      const uploaded = await uploadRendered(image.id, blob);
      setResult(uploaded);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ukjent feil ved rendering';
      setError(message);
    } finally {
      setRendering(false);
    }
  }

  return (
    <div>
      <Header title="Render story" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Render story</h1>
          <p className="text-sm text-gray-600 mt-1">Lag en story med valgt bilde og tekst.</p>
        </div>
        <div className="card p-4 space-y-3">
          <label className="text-xs text-gray-500">Velg bilde</label>
          <select
            className="input w-full"
            value={selectedId || ''}
            onChange={(e) => {
              const nextId = e.target.value || null;
              setSelectedId(nextId);
              setResult(null);
              if (!nextId) {
                setImage(null);
                router.push('/admin/render', undefined, { shallow: true });
                return;
              }
              router.push({ pathname: '/admin/render', query: { imageId: nextId } }, undefined, { shallow: true });
            }}
            disabled={listLoading}
          >
            <option value="">Velg bilde</option>
            {allImages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tags?.number ? `#${item.tags.number} — ` : ''}{item.tags?.eventType || 'Alle'}
              </option>
            ))}
          </select>
          {listError && <div className="text-sm text-red-500">{listError}</div>}
        </div>

        {!selectedId && !loading && (
          <div className="text-sm text-gray-600">Velg et bilde for å lage story</div>
        )}

        {loading && selectedId && (
          <div className="text-sm text-gray-600">Laster bildet...</div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}

        {image && !loading && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="card p-4">
              <div className="bg-gray-100" style={{ height: 520 }}>
                <img
                  src={image.image_url}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>

            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500">Overskrift</label>
                <input
                  className="input w-full mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Skriv overskrift"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Ekstra tekst</label>
                <textarea
                  className="input w-full mt-1"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Skriv ekstra tekst"
                />
              </div>
              <button
                className="btn-primary w-full"
                disabled={rendering}
                onClick={renderStory}
              >
                {rendering ? 'Genererer...' : 'Generer story'}
              </button>
              {result && (
                <a
                  href={result}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary inline-block"
                >
                  Åpne ferdig bilde
                </a>
              )}
            </div>
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
  const fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

  const sizes = lines.map((_, index) => (index === 0 ? 96 : 56));
  const minSizes = lines.map((_, index) => (index === 0 ? 56 : 32));

  const fits = () => lines.every((line, index) => {
    ctx.font = `700 ${sizes[index]}px ${fontFamily}`;
    return ctx.measureText(line).width <= maxWidth;
  });

  while (!fits() && sizes.some((size, index) => size > minSizes[index])) {
    for (let i = 0; i < sizes.length; i += 1) {
      if (sizes[i] > minSizes[i]) sizes[i] -= 4;
    }
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const lineHeights = sizes.map(size => size * 1.2);
  const totalHeight = lineHeights.reduce((sum, h) => sum + h, 0);
  const minY = 40;
  const maxY = height - totalHeight - 40;
  const centeredY = height / 2 - totalHeight / 2;
  const startY = Math.min(Math.max(centeredY, minY), maxY);

  let offsetY = startY;
  lines.forEach((line, index) => {
    ctx.font = `700 ${sizes[index]}px ${fontFamily}`;
    const y = offsetY + lineHeights[index] / 2;
    ctx.fillText(line, width / 2, y, maxWidth);
    offsetY += lineHeights[index];
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
  form.append('type', 'rendered');
  form.append('sourceImageId', imageId);

  const res = await fetch('/api/upload-image', {
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
