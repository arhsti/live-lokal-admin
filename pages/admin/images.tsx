import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import ImageCard from '../../components/ImageCard';

interface ImageData {
  id: string;
  image_url: string;
  tags?: { number: string; eventType?: string; type?: 'raw' | 'rendered' };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { number: string; eventType: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string | null>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
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
        method: 'POST',
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

  return (
    <div>
      <Header title="Bildebibliotek" />
      <main className="container-base space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Bildebibliotek</h1>
            <p className="text-sm text-gray-600 mt-1">Upload and manage images</p>
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
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '2.5vw',
            }}
          >
            {images.map((image) => {
              const current = editing[image.id] || { number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
              return (
                <ImageCard
                  key={image.id}
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
                  extraActions={image.tags?.type === 'rendered' ? null : (
                    <Link href={`/admin/render?imageId=${encodeURIComponent(image.id)}`} className="btn-secondary">
                      Bruk i story
                    </Link>
                  )}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
