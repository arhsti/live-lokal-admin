import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { ImageLibrary } from '@/components/ImageLibrary';

interface ImageData {
  id: string;
  url: string;
  description: string;
  jerseyNumber: string;
  eventType: string;
}

export default function ImagesV2Page() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        const mappedImages = Array.isArray(data) ? data.map((img: any) => ({
          id: img.id,
          url: img.imageUrl || img.url || '',
          description: img.tags?.description || '',
          jerseyNumber: img.tags?.number || '',
          eventType: img.tags?.eventType || '',
        })) : [];
        setImages(mappedImages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = () => {
    alert('Last opp bilde-funksjonalitet vil bli implementert');
  };

  const handleUpdateImage = async (id: string, data: Partial<ImageData>) => {
    try {
      const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: data.jerseyNumber,
          eventType: data.eventType,
          description: data.description,
        }),
      });

      if (res.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, ...data } : img
        ));
        alert('Bilde oppdatert');
      }
    } catch (error) {
      console.error(error);
      alert('Kunne ikke oppdatere bilde');
    }
  };

  const handleUseInStory = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      alert(`Bildet for spiller #${image.jerseyNumber} er nå klart for bruk i story`);
    }
  };

  const handlePostStory = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      alert(`Story publisert for spiller #${image.jerseyNumber}!`);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Bildebibliotek" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#64748B]">Laster...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Bildebibliotek" />
      <main>
        <ImageLibrary
          images={images}
          onUpload={handleUpload}
          onUpdateImage={handleUpdateImage}
          onUseInStory={handleUseInStory}
          onPostStory={handlePostStory}
        />
      </main>
    </>
  );
}
            eventType: current.eventType,
            description: current.description,
          },
        } : im));
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
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/images">
            <Button variant="outline" uiSize="icon" className="h-10 w-10 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[hsl(220_30%_15%)]">Images</h1>
            <p className="text-sm text-[hsl(220_10%_45%)] max-w-xl">
              Oppdater spillerprofilene med draktnummer og hendelser på en rask og trygg måte.
            </p>
          </div>
        </div>
        <div className="rounded-full border border-[hsl(220_15%_85%)] bg-[hsl(210_40%_96%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(220_20%_35%)]">
          Ny visning
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[hsl(220_10%_45%)]">Laster bilder...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {sortedImages.map((image) => {
            const current = getCurrent(image);
            const displayName = current.description?.trim() || 'Ukjent spiller';
            return (
              <Card
                key={image.id}
                className="group overflow-hidden rounded-2xl border border-[hsl(220_15%_88%)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 w-full overflow-hidden md:h-64">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={displayName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[hsl(210_20%_96%)] text-sm text-[hsl(220_10%_55%)]">
                      Ingen bilde
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-[hsl(220_25%_15%)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                    Draktnummer {current.number || '—'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-[hsl(220_30%_15%)]">{displayName}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[hsl(220_10%_45%)]">
                      Hendelse: {current.eventType || 'Alle'}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(220_10%_40%)]">
                        Spiller
                      </label>
                      <Input
                        value={current.description}
                        onChange={(e) => updateEditing(image, { ...current, description: e.target.value })}
                        placeholder="Navn på spiller"
                        className="h-10 rounded-xl border-[hsl(220_15%_85%)] bg-white text-[hsl(220_20%_20%)]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(220_10%_40%)]">
                          Draktnummer
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={current.number}
                          onChange={(e) => updateEditing(image, { ...current, number: e.target.value.replace(/\D/g, '') })}
                          placeholder="00"
                          className="h-10 rounded-xl border-[hsl(220_15%_85%)] bg-white text-[hsl(220_20%_20%)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(220_10%_40%)]">
                          Hendelse
                        </label>
                        <Select
                          value={current.eventType}
                          onChange={(e) => updateEditing(image, { ...current, eventType: e.target.value })}
                          className="h-10 rounded-xl border-[hsl(220_15%_85%)] bg-white text-sm"
                        >
                          {eventOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="h-10 w-full rounded-xl"
                      onClick={() => handleSave(image)}
                      disabled={!!saving[image.id]}
                    >
                      <Save className="h-4 w-4" />
                      {saving[image.id] ? 'Lagrer...' : 'Lagre endringer'}
                    </Button>

                    {saveErrors[image.id] && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        {saveErrors[image.id]}
                      </div>
                    )}
                    {saveSuccess[image.id] && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                        Lagret ✓
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
