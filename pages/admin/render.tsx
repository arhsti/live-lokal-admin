import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import ImageCard from '../../components/ImageCard';

interface ImageData {
  id: string;
  image_url: string;
  tags?: { number: string; eventType?: string };
}

export default function RenderPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { number: string; eventType: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string | null>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [rendering, setRendering] = useState<Record<string, boolean>>({});
  const [renderErrors, setRenderErrors] = useState<Record<string, string | null>>({});
  const [renderSuccess, setRenderSuccess] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement | null>(null);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const file = formData.get('file') as File;
    if (!file) {
      setUploadError('No file selected');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await loadImages();
        formRef.current.reset();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (image: ImageData) => {
    const current = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
    const num = parseInt(String(current.number || ''), 10);
    if (Number.isNaN(num) || num < 1 || num > 99) {
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Draktnummer må være et tall mellom 1 og 99' }));
      return;
    }

    setSaveErrors(prev => ({ ...prev, [image.id]: null }));
    setSaving(prev => ({ ...prev, [image.id]: true }));

    try {
      const res = await fetch('/api/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: image.id, number: String(num), eventType: current.eventType }),
      });

      if (res.ok) {
        const updated = await res.json().catch(() => null);
        setImages(prev => prev.map(im => im.id === image.id ? { ...im, tags: updated?.tags || { number: String(num), eventType: current.eventType } } : im));
        setSaveSuccess(prev => ({ ...prev, [image.id]: true }));
        setTimeout(() => setSaveSuccess(prev => ({ ...prev, [image.id]: false })), 2500);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }));
        setSaveErrors(prev => ({ ...prev, [image.id]: err.error || 'Failed to save' }));
      }
    } catch (e) {
      console.error(e);
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Failed to save' }));
    } finally {
      setSaving(prev => ({ ...prev, [image.id]: false }));
    }
  };

  const renderToBlob = async (imageUrl: string, number: string, eventType: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1080;
    canvas.height = img.naturalHeight || 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const fontSize = Math.max(32, Math.round(canvas.width * 0.05));
    const lineHeight = Math.round(fontSize * 1.2);
    const padding = Math.max(24, Math.round(canvas.width * 0.04));

    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const lines = [
      `#${number || '—'}`,
      eventType || 'Alle',
    ];

    const startY = canvas.height - padding - lineHeight * lines.length;
    const startX = padding;

    lines.forEach((line, index) => {
      ctx.fillText(line, startX, startY + index * lineHeight);
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to create JPG'));
        resolve(blob);
      }, 'image/jpeg', 0.92);
    });
  };

  const handleRender = async (image: ImageData) => {
    const current = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
    setRenderErrors(prev => ({ ...prev, [image.id]: null }));
    setRenderSuccess(prev => ({ ...prev, [image.id]: false }));
    setRendering(prev => ({ ...prev, [image.id]: true }));

    try {
      const blob = await renderToBlob(image.image_url, current.number, current.eventType);
      const formData = new FormData();
      const filename = `${image.id}-${Date.now()}.jpg`;
      formData.append('file', new File([blob], filename, { type: 'image/jpeg' }));

      const res = await fetch('/api/upload-rendered', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        setRenderErrors(prev => ({ ...prev, [image.id]: err.error || 'Upload failed' }));
        return;
      }

      setRenderSuccess(prev => ({ ...prev, [image.id]: true }));
      setTimeout(() => setRenderSuccess(prev => ({ ...prev, [image.id]: false })), 2500);
    } catch (e: any) {
      console.error(e);
      setRenderErrors(prev => ({ ...prev, [image.id]: e?.message || 'Render failed' }));
    } finally {
      setRendering(prev => ({ ...prev, [image.id]: false }));
    }
  };

  return (
    <div>
      <Header title="Render" />
      <main className="container-base space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Render stories (copy of Images)</h1>
            <p className="text-sm text-gray-600 mt-1">Same gallery and controls as Images, with client-side render</p>
            <p className="text-xs text-gray-500 mt-1">Route marker: /admin/render</p>
          </div>
          <div className="flex items-center gap-3">
            <form ref={formRef} onSubmit={handleUpload} encType="multipart/form-data" className="hidden">
              <input
                id="file-input"
                type="file"
                name="file"
                accept="image/jpeg,image/png"
                required
                onChange={() => { try { formRef.current?.requestSubmit(); } catch (e) {} }}
              />
            </form>
            <button
              onClick={() => {
                const el = document.getElementById('file-input') as HTMLInputElement | null;
                el?.click();
              }}
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
          </div>
        </div>

        {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}

        {loading ? (
          <div className="text-sm text-gray-600">Laster bilder...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => {
              const current = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
              return (
                <div key={image.id} className="space-y-3">
                  <ImageCard
                    imageUrl={image.image_url}
                    number={current.number}
                    eventType={current.eventType}
                    onNumberChange={(value) => {
                      setEditing(prev => ({ ...prev, [image.id]: { ...current, number: value } }));
                      setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                      setSaveSuccess(prev => ({ ...prev, [image.id]: false }));
                    }}
                    onEventChange={(value) => {
                      setEditing(prev => ({ ...prev, [image.id]: { ...current, eventType: value } }));
                      setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                      setSaveSuccess(prev => ({ ...prev, [image.id]: false }));
                    }}
                    onSave={() => handleSave(image)}
                    saving={!!saving[image.id]}
                    error={saveErrors[image.id]}
                    success={saveSuccess[image.id]}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      className="btn-secondary"
                      onClick={() => handleRender(image)}
                      disabled={!!rendering[image.id]}
                    >
                      {rendering[image.id] ? 'Rendering...' : 'Render JPG'}
                    </button>
                    {renderErrors[image.id] && <div className="text-sm text-red-500">{renderErrors[image.id]}</div>}
                    {renderSuccess[image.id] && <div className="text-sm text-green-600">Rendered ✓</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
