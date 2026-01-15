"use client";

import { useEffect, useRef, useState } from 'react';

interface ImageData {
  id: string;
  image_url: string;
  created_at?: string;
  tags?: { number: string; eventType?: string };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [editing, setEditing] = useState<Record<string, { number: string; eventType: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string | null>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
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
        try { window.dispatchEvent(new CustomEvent('images:updated')); } catch (e) {}
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed response:', errorData);
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Tags are persisted server-side via PUT /api/images/{id} (stored in the backend metadata store),
  // so values survive refreshes and deployments and are not kept only in frontend state.
  const handleSave = async (image: ImageData) => {
    const toSave = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
    const num = parseInt(String(toSave.number || ''), 10);
    if (isNaN(num) || num < 1 || num > 99) {
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Draktnummer må være et tall mellom 1 og 99' }));
      return;
    }

    setSaveErrors(prev => ({ ...prev, [image.id]: null }));
    setSaving(prev => ({ ...prev, [image.id]: true }));
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: String(num), eventType: toSave.eventType }),
      });
      if (res.ok) {
        setSaveErrors(prev => ({ ...prev, [image.id]: null }));
        setSaveSuccess(prev => ({ ...prev, [image.id]: true }));
        setTimeout(() => setSaveSuccess(prev => ({ ...prev, [image.id]: false })), 2500);

        const contentType = res.headers.get('content-type') || '';
        const hasJson = contentType.includes('application/json');
        if (hasJson) {
          const updated = await res.json().catch(() => null);
          const nextTags = updated?.tags ?? { number: String(num), eventType: toSave.eventType };
          setImages(prev => prev.map(im => im.id === image.id ? { ...im, tags: nextTags } : im));
        } else {
          setImages(prev => prev.map(im => im.id === image.id ? { ...im, tags: { number: String(num), eventType: toSave.eventType } } : im));
        }
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      const hasJson = contentType.includes('application/json');
      const err = hasJson ? await res.json().catch(() => ({ error: 'Unknown error' })) : { error: 'Failed to save' };
      setSaveErrors(prev => ({ ...prev, [image.id]: err.error || 'Failed to save' }));
    } catch (e) {
      console.error(e);
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Failed to save' }));
    } finally {
      setSaving(prev => ({ ...prev, [image.id]: false }));
    }
  };

  if (loading) return <div className="p-8">Loading images...</div>;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Bildegalleri</h1>
          <p className="text-sm text-gray-600 mt-1">Oversikt over bilder</p>
        </div>
        <div className="flex items-center space-x-3">
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
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-xl font-semibold border border-blue-200"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      {uploadError && <div className="text-sm text-red-500 mb-4">{uploadError}</div>}

      <div className="flex flex-wrap" style={{ columnGap: '2rem', rowGap: '2rem' }}>
        {images.map(image => {
          const current = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
          return (
            <div key={image.id} style={{ flex: '0 1 28%', maxWidth: '28%', width: '100%' }} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative bg-gray-100 overflow-hidden" style={{ height: 180 }}>
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={`Image ${image.id}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Ingen bilde</div>
                )}
                <div className="absolute top-2 left-2 bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-xs shadow">{current.number || image.tags?.number || '—'}</div>
              </div>

              <div className="p-3">
                <div className="mb-2">
                  <div className="grid gap-2 items-end grid-cols-1 sm:grid-cols-[2fr_2fr_1fr]">
                    <div>
                      <label className="text-xs text-gray-500">Draktnummer</label>
                      <input type="number" min={1} max={99} value={current.number} onChange={(e) => { let v=e.target.value.replace(/\D/g,''); setEditing(prev=>({...prev,[image.id]:{...current,number:v}})); setSaveErrors(prev => ({ ...prev, [image.id]: null })); setSaveSuccess(prev => ({ ...prev, [image.id]: false })); }} className="w-full mt-1 input text-xs h-8" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Hendelse</label>
                      <select value={current.eventType} onChange={(e) => { setEditing(prev => ({ ...prev, [image.id]: { ...current, eventType: e.target.value } })); setSaveErrors(prev => ({ ...prev, [image.id]: null })); setSaveSuccess(prev => ({ ...prev, [image.id]: false })); }} className="w-full mt-1 input text-xs h-8">
                        <option value="Alle">Alle</option>
                        <option value="Mål">Mål</option>
                        <option value="Kort">Kort</option>
                        <option value="Bytte">Bytte</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">&nbsp;</label>
                      <button
                        onClick={() => handleSave(image)}
                        disabled={saving[image.id]}
                        className="w-full mt-1 h-8 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold shadow-sm hover:bg-blue-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving[image.id] ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {saveErrors[image.id] && <div className="text-sm text-red-500">{saveErrors[image.id]}</div>}
                    {saveSuccess[image.id] && <div className="text-sm text-green-600">Lagret ✓</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
