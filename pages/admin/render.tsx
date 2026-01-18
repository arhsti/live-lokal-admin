import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

interface ImageItem {
  id: string;
  imageUrl: string;
  tags?: { number: string; eventType?: string };
}

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
  const [hendelse, setHendelse] = useState('');
  const [tidspunkt, setTidspunkt] = useState('');

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
      const uploaded = await renderOnServer(image.imageUrl, hendelse.trim(), tidspunkt.trim());
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
                  src={image.imageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>

            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500">Hendelse</label>
                <input
                  className="input w-full mt-1"
                  value={hendelse}
                  onChange={(e) => setHendelse(e.target.value)}
                  placeholder="Skriv hendelse"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tidspunkt</label>
                <input
                  className="input w-full mt-1"
                  value={tidspunkt}
                  onChange={(e) => setTidspunkt(e.target.value)}
                  placeholder="Skriv tidspunkt"
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

async function renderOnServer(imageUrl: string, hendelse: string, tidspunkt: string) {
  const res = await fetch('/api/render-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, hendelse, tidspunkt }),
  });

  const data = await res.json().catch(() => ({ success: false, error: 'Render feilet' }));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Render feilet');
  }

  return data.url as string;
}
