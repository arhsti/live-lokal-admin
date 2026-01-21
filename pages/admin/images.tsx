import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, ChevronLeft, Plus, Instagram } from 'lucide-react';
import Link from 'next/link';
import ImageCard from '@/components/ImageCard';
import StoryPreviewModal from '@/components/StoryPreviewModal';
import { Button } from '@/components/ui/Button';
import { ImageGrid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/components/ui/utils';
import { layout, typography, status, icon, filterBar, imageCard } from '@/styles/tokens';

interface ImageData {
  id: string;
  imageUrl: string;
  created_at?: string;
  tags?: { number: string; eventType?: string; type?: 'processed' | 'rendered'; description?: string };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { number: string; eventType: string; description: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string | null>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState<Record<string, boolean>>({});
  const [postErrors, setPostErrors] = useState<Record<string, string | null>>({});
  const [postSuccess, setPostSuccess] = useState<Record<string, boolean>>({});
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'number' | 'event'>('newest');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchValue.trim()), 200);
    return () => clearTimeout(id);
  }, [searchValue]);

  const filteredImages = useMemo(() => {
    const list = [...images];
    const filtered = debouncedSearch
      ? list.filter((image) => (image.tags?.number || '').includes(debouncedSearch))
      : list;

    if (sortBy === 'number') {
      return filtered.sort((a, b) => {
        const an = parseInt(a.tags?.number || '0', 10) || 0;
        const bn = parseInt(b.tags?.number || '0', 10) || 0;
        return an - bn;
      });
    }
    if (sortBy === 'event') {
      return filtered.sort((a, b) => (a.tags?.eventType || '').localeCompare(b.tags?.eventType || ''));
    }

    return filtered.sort((a, b) => {
      const at = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (bt !== at) return bt - at;
      return b.id.localeCompare(a.id);
    });
  }, [images, debouncedSearch, sortBy]);

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
    const current = editing[image.id] || {
      number: image.tags?.number || '',
      eventType: image.tags?.eventType || 'Alle',
      description: image.tags?.description || '',
    };
    const num = parseInt(String(current.number || ''), 10);
    if (Number.isNaN(num) || num < 1 || num > 99) {
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Draktnummer må være et tall mellom 1 og 99' }));
      return false;
    }

    setSaveErrors(prev => ({ ...prev, [image.id]: null }));
    setSaving(prev => ({ ...prev, [image.id]: true }));

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: image.id,
          number: String(num),
          eventType: current.eventType,
          description: current.description,
        }),
      });

      if (res.ok) {
        const updated = await res.json().catch(() => null);
        setImages(prev => prev.map(im => im.id === image.id ? {
          ...im,
          tags: updated?.tags || {
            number: String(num),
            eventType: current.eventType,
            description: current.description,
          },
        } : im));
        setSaveSuccess(prev => ({ ...prev, [image.id]: true }));
        setTimeout(() => setSaveSuccess(prev => ({ ...prev, [image.id]: false })), 2500);
        return true;
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }));
        setSaveErrors(prev => ({ ...prev, [image.id]: err.error || 'Failed to save' }));
        return false;
      }
    } catch (e) {
      console.error(e);
      setSaveErrors(prev => ({ ...prev, [image.id]: 'Failed to save' }));
      return false;
    } finally {
      setSaving(prev => ({ ...prev, [image.id]: false }));
    }
  };

  const handlePostStory = async (image: ImageData) => {
    setPostErrors(prev => ({ ...prev, [image.id]: null }));
    setPostSuccess(prev => ({ ...prev, [image.id]: false }));
    setPosting(prev => ({ ...prev, [image.id]: true }));

    try {
      const saved = await handleSave(image);
      if (!saved) {
        setPostErrors(prev => ({ ...prev, [image.id]: 'Lagring feilet. Kan ikke publisere.' }));
        return;
      }

      const current = editing[image.id] || {
        number: image.tags?.number || '',
        eventType: image.tags?.eventType || 'Alle',
        description: image.tags?.description || '',
      };

      const res = await fetch('/api/trigger-story-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: image.imageUrl,
          description: current.description,
          draktnummer: current.number,
          hendelse: current.eventType,
        }),
      });

      const data = await res.json().catch(() => ({ success: false, error: 'Webhook failed' }));
      if (!res.ok || data.success === false) {
        setPostErrors(prev => ({ ...prev, [image.id]: data.error || 'Webhook failed' }));
        return;
      }

      setPostSuccess(prev => ({ ...prev, [image.id]: true }));
      setTimeout(() => setPostSuccess(prev => ({ ...prev, [image.id]: false })), 2500);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Webhook failed';
      setPostErrors(prev => ({ ...prev, [image.id]: message }));
    } finally {
      setPosting(prev => ({ ...prev, [image.id]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" uiSize="icon" className="h-10 w-10 rounded-full">
                <ChevronLeft className={icon.md} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bildebibliotek</h1>
              <p className={typography.subtitle}>Administrer og tagg bilder fra kamper</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={filterBar.wrap}>
              <span className={filterBar.label}>Søk draktnr:</span>
              <Input
                placeholder="F.eks. 10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-[80px] shadow-none font-mono text-sm"
                uiSize="sm"
                variant="filter"
              />
            </div>

            <div className={filterBar.wrap}>
              <ArrowUpDown className={icon.smMuted} />
              <span className={filterBar.label}>Sorter:</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-[120px] shadow-none text-sm"
                uiSize="sm"
                variant="filter"
              >
                <option value="newest">Nyeste</option>
                <option value="number">Draktnummer</option>
                <option value="event">Hendelse</option>
              </Select>
            </div>

            <form ref={formRef} onSubmit={handleUpload} encType="multipart/form-data" className={layout.hidden}>
              <input
                id="file-input"
                type="file"
                name="file"
                accept="image/jpeg,image/png"
                required
                onChange={() => {
                  try {
                    formRef.current?.requestSubmit();
                  } catch (e) {}
                }}
              />
            </form>
            <Button
              className="shadow-sm"
              onClick={() => {
                const el = document.getElementById('file-input') as HTMLInputElement | null;
                el?.click();
              }}
              disabled={uploading}
            >
              <Plus className={icon.sm} />
              {uploading ? 'Laster opp...' : 'Last opp'}
            </Button>
          </div>
        </div>

        {uploadError && <div className={status.error}>{uploadError}</div>}

        {loading ? (
          <div className={status.muted}>Laster bilder...</div>
        ) : (
          <ImageGrid>
            {filteredImages.map((image) => {
              const current = editing[image.id] || {
                number: image.tags?.number || '',
                eventType: image.tags?.eventType || 'Alle',
                description: image.tags?.description || '',
              };
              return (
                <ImageCard
                  key={image.id}
                  imageUrl={image.imageUrl}
                  description={current.description}
                  number={current.number}
                  eventType={current.eventType}
                  onDescriptionChange={(value) => {
                    setEditing(prev => ({ ...prev, [image.id]: { ...current, description: value } }));
                    setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                    setSaveSuccess(prev => ({ ...prev, [image.id]: false }));
                  }}
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
                  error={saveErrors[image.id] || postErrors[image.id]}
                  success={saveSuccess[image.id] || postSuccess[image.id]}
                  extraActions={image.tags?.type === 'rendered' ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      uiSize="sm"
                      onClick={() => setPreviewUrl(image.imageUrl)}
                      className={cn('flex-1', imageCard.button, imageCard.buttonOutline)}
                    >
                      <Instagram className="h-3 w-3" />
                      Story
                    </Button>
                  )}
                />
              );
            })}
          </ImageGrid>
        )}
      
      <StoryPreviewModal open={!!previewUrl} imageUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}
