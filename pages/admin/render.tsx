import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import StoryPreviewFrame from '@/components/StoryPreviewFrame';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { AnchorButton } from '@/components/ui/AnchorButton';
import { SplitGrid } from '@/components/ui/SplitGrid';
import { cn } from '@/components/ui/utils';
import { layout, spacing, typography, status } from '@/styles/tokens';

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
  const [stilling, setStilling] = useState('');
  const [hendelse, setHendelse] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [tidspunkt, setTidspunkt] = useState('');
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);

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
      const overlay = await createOverlayPng({
        stilling: stilling.trim(),
        hendelse: hendelse.trim(),
        beskrivelse: beskrivelse.trim(),
        tidspunkt: tidspunkt.trim(),
      });
      if (!overlay) {
        throw new Error('Overlay PNG is missing');
      }
      setOverlayUrl(overlay.previewUrl);
      const uploaded = await renderOnServer(image.imageUrl, overlay.blob);
      setResult(uploaded);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ukjent feil ved rendering';
      setError(message);
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className={cn(layout.col, spacing.section)}>
      <div className={cn(layout.col, spacing.stackTight)}>
        <h1 className={typography.pageTitle}>Render story</h1>
        <p className={typography.subtitle}>Lag en story med valgt bilde og tekst.</p>
      </div>
      <Card>
        <CardContent className={spacing.stack}>
          <Label className={typography.formLabel}>Velg bilde</Label>
          <Select
            className={layout.wFull}
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
          </Select>
          {listError && <div className={status.error}>{listError}</div>}
        </CardContent>
      </Card>

        {!selectedId && !loading && (
          <div className={status.muted}>Velg et bilde for å lage story</div>
        )}

        {loading && selectedId && (
          <div className={status.muted}>Laster bildet...</div>
        )}

        {error && <div className={status.error}>{error}</div>}

      {image && !loading && (
        <SplitGrid>
          <Card>
            <CardContent>
              <StoryPreviewFrame imageUrl={image.imageUrl} overlayUrl={overlayUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className={spacing.stack}>
              <div className={cn(layout.col, spacing.field)}>
                <Label className={typography.formLabel}>Stilling</Label>
                <Input
                  className={layout.wFull}
                  value={stilling}
                  onChange={(e) => setStilling(e.target.value)}
                  placeholder="1-2"
                />
              </div>
              <div className={cn(layout.col, spacing.field)}>
                <Label className={typography.formLabel}>Hendelse</Label>
                <Input
                  className={layout.wFull}
                  value={hendelse}
                  onChange={(e) => setHendelse(e.target.value)}
                  placeholder="Skriv hendelse"
                />
              </div>
              <div className={cn(layout.col, spacing.field)}>
                <Label className={typography.formLabel}>Beskrivelse</Label>
                <Input
                  className={layout.wFull}
                  value={beskrivelse}
                  onChange={(e) => setBeskrivelse(e.target.value)}
                  placeholder="Skriv beskrivelse"
                />
              </div>
              <div className={cn(layout.col, spacing.field)}>
                <Label className={typography.formLabel}>Tidspunkt</Label>
                <Input
                  className={layout.wFull}
                  value={tidspunkt}
                  onChange={(e) => setTidspunkt(e.target.value)}
                  placeholder="Skriv tidspunkt"
                />
              </div>
              <Button
                className={layout.wFull}
                disabled={rendering}
                onClick={renderStory}
              >
                {rendering ? 'Genererer...' : 'Generer story'}
              </Button>
              {result && (
                <AnchorButton href={result} target="_blank" rel="noreferrer">
                  Åpne ferdig bilde
                </AnchorButton>
              )}
            </CardContent>
          </Card>
        </SplitGrid>
      )}
    </div>
  );
}

async function renderOnServer(imageUrl: string, overlayPng: Blob) {
  const formData = new FormData();
  formData.append('imageUrl', imageUrl);
  formData.append('overlayPng', overlayPng, 'overlay.png');

  const res = await fetch('/api/render-image', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({ success: false, error: 'Render feilet' }));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Render feilet');
  }

  return data.url as string;
}

async function createOverlayPng({
  stilling,
  hendelse,
  beskrivelse,
  tidspunkt,
}: {
  stilling: string;
  hendelse: string;
  beskrivelse: string;
  tidspunkt: string;
}) {
  if (!hendelse || !tidspunkt) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';

  const scoreY = canvas.height * 0.65;
  const hendelseY = canvas.height * 0.72;
  const beskrivelseY = canvas.height * 0.78;
  const tidspunktY = canvas.height * 0.84;

  if (stilling) {
    const [homeRaw, awayRaw] = stilling.split('-').map((part) => part.trim());
    const homeScore = homeRaw || '';
    const awayScore = awayRaw || '';
    if (homeScore && awayScore) {
      ctx.lineWidth = 5;
      ctx.font = 'bold 110px sans-serif';
      ctx.strokeText(homeScore, 540 - 80, scoreY);
      ctx.fillText(homeScore, 540 - 80, scoreY);
      ctx.strokeText('-', 540, scoreY);
      ctx.fillText('-', 540, scoreY);
      ctx.strokeText(awayScore, 540 + 80, scoreY);
      ctx.fillText(awayScore, 540 + 80, scoreY);
    }
  }

  ctx.lineWidth = 4;
  ctx.font = 'bold 104px sans-serif';
  ctx.strokeText(hendelse, canvas.width / 2, hendelseY);
  ctx.fillText(hendelse, canvas.width / 2, hendelseY);

  if (beskrivelse) {
    ctx.lineWidth = 4;
    ctx.font = '68px sans-serif';
    ctx.strokeText(beskrivelse, canvas.width / 2, beskrivelseY);
    ctx.fillText(beskrivelse, canvas.width / 2, beskrivelseY);
  }

  ctx.lineWidth = 3;
  ctx.font = '56px sans-serif';
  ctx.strokeText(tidspunkt, canvas.width / 2, tidspunktY);
  ctx.fillText(tidspunkt, canvas.width / 2, tidspunktY);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png');
  });
  if (!blob) return null;

  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
  };
}
