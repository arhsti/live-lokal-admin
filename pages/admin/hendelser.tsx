import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';

interface MatchEvent {
  id: string;
  hendelse: string;
  tidspunkt: string;
  draktnummer: string;
  objectId_match?: string;
  createdAt: string;
  status: 'pending' | 'posted' | 'failed';
  renderedImageUrl?: string | null;
}

export default function HendelserPage() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState<Record<string, boolean>>({});
  const [postErrors, setPostErrors] = useState<Record<string, string | null>>({});
  const [postSuccess, setPostSuccess] = useState<Record<string, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Kunne ikke laste hendelser' }));
        setError(data.error || 'Kunne ikke laste hendelser');
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setEvents(list);
      const grouped = groupEventsByMatch(list);
      const matchIds = Object.keys(grouped);
      if (matchIds.length === 0) {
        setActiveMatchId(null);
      } else if (!activeMatchId || !grouped[activeMatchId]) {
        setActiveMatchId(matchIds[0]);
      }
    } catch (_e) {
      setError('Kunne ikke laste hendelser');
    } finally {
      setLoading(false);
    }
  }

  async function handlePost(event: MatchEvent) {
    if (event.status === 'posted') {
      return;
    }
    setPostErrors(prev => ({ ...prev, [event.id]: null }));
    setPostSuccess(prev => ({ ...prev, [event.id]: false }));
    setPosting(prev => ({ ...prev, [event.id]: true }));

    try {
      const overlay = await createEventOverlayPng(event);
      if (!overlay) {
        throw new Error('Kunne ikke lage overlay');
      }

      const formData = new FormData();
      formData.append('eventId', event.id);
      formData.append('overlayPng', overlay, 'overlay.png');

      const res = await fetch('/api/trigger-story', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({ success: false, error: 'Publisering feilet' }));
      if (!res.ok || data.success === false) {
        setPostErrors(prev => ({ ...prev, [event.id]: data.error || 'Publisering feilet' }));
        setEvents(prev => prev.map(item => item.id === event.id ? { ...item, status: 'failed' } : item));
        return;
      }

      setPostSuccess(prev => ({ ...prev, [event.id]: true }));
      setEvents(prev => prev.map(item => item.id === event.id ? {
        ...item,
        status: 'posted',
        renderedImageUrl: data.imageUrl || item.renderedImageUrl || null,
      } : item));
      setTimeout(() => setPostSuccess(prev => ({ ...prev, [event.id]: false })), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publisering feilet';
      setPostErrors(prev => ({ ...prev, [event.id]: message }));
      setEvents(prev => prev.map(item => item.id === event.id ? { ...item, status: 'failed' } : item));
    } finally {
      setPosting(prev => ({ ...prev, [event.id]: false }));
    }
  }

  const openPreview = (url: string | null | undefined) => {
    if (!url) return;
    setPreviewUrl(url);
  };

  const closePreview = () => setPreviewUrl(null);

  const groupedEvents = useMemo(() => groupEventsByMatch(events), [events]);
  const eventTypeColor = (value: string) => {
    const lower = value.toLowerCase();
    if (lower.includes('mål')) return 'bg-emerald-500';
    if (lower.includes('kort')) return 'bg-yellow-500';
    if (lower.includes('bytte')) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div>
      <Header title="Hendelser" />
      <main className="container-base space-y-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Hendelser</h1>
          <p className="text-base text-gray-600">Oversikt over kamp-hendelser.</p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        {loading ? (
          <div className="text-sm text-gray-600">Laster hendelser...</div>
        ) : (
          <div className="space-y-14">
            {events.length === 0 ? (
              <div className="card admin-card text-sm text-gray-600">Ingen hendelser funnet.</div>
            ) : (
              <>
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                  {Object.entries(groupedEvents).map(([matchId, matchEvents]) => {
                    const isActive = activeMatchId === matchId;
                    return (
                      <button
                        key={matchId}
                        type="button"
                        onClick={() => setActiveMatchId(isActive ? null : matchId)}
                        className={`card admin-card-large text-left transition-all border-2 ${isActive ? 'border-gray-900 shadow-soft' : 'border-transparent hover:border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Match</div>
                            <div className="text-2xl font-bold text-gray-900">{matchId}</div>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{matchEvents.length} hendelser</span>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            {isActive ? 'Skjul hendelser' : 'Vis hendelser'}
                            {!isActive && <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                            </span>}
                          </span>
                          <span className="text-gray-400">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeMatchId ? (
                  <div className="card admin-card shadow-soft space-y-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Match: {activeMatchId}</h2>
                        <p className="text-xs text-gray-500">{groupedEvents[activeMatchId]?.length || 0} hendelser</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 bg-gray-50">
                            <th className="py-3 pr-6">Hendelse</th>
                            <th className="py-3 pr-6">Tidspunkt</th>
                            <th className="py-3 pr-6">Draktnummer</th>
                            <th className="py-3 pr-6">Status</th>
                            <th className="py-3 pr-6 text-center">Preview</th>
                            <th className="py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(groupedEvents[activeMatchId] || []).map((event) => {
                            const isPosted = event.status === 'posted';
                            const isPosting = !!posting[event.id];
                            return (
                              <tr key={event.id} className="border-t border-gray-100">
                                <td className="py-4 pr-6">
                                  <div className="flex items-center gap-2 font-medium text-gray-900">
                                    <span className={`h-2 w-2 rounded-full ${eventTypeColor(event.hendelse)}`} />
                                    {event.hendelse}
                                  </div>
                                </td>
                                <td className="py-4 pr-6 font-mono text-gray-700">{event.tidspunkt}</td>
                                <td className="py-4 pr-6 text-gray-700">#{event.draktnummer}</td>
                                <td className="py-4 pr-6">
                                  {isPosted ? (
                                    <span className="badge bg-emerald-50 text-emerald-700">Publisert</span>
                                  ) : (
                                    <span className="badge border border-gray-200 bg-transparent text-gray-600">Utkast</span>
                                  )}
                                </td>
                                <td className="py-4 pr-6 text-center">
                                  {isPosted && event.renderedImageUrl ? (
                                    <button
                                      type="button"
                                      className="btn-secondary whitespace-nowrap mx-auto"
                                      onClick={() => openPreview(event.renderedImageUrl)}
                                    >
                                      View story
                                    </button>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-3 text-center">
                                  <button
                                    className="btn-primary whitespace-nowrap"
                                    onClick={() => handlePost(event)}
                                    disabled={isPosting || isPosted}
                                  >
                                    {isPosted ? 'Posted ✓' : (isPosting ? 'Sender...' : 'Post')}
                                  </button>
                                  {postErrors[event.id] && (
                                    <div className="text-xs text-red-500 mt-2">{postErrors[event.id]}</div>
                                  )}
                                  {postSuccess[event.id] && (
                                    <div className="text-xs text-green-600 mt-2">Publisert ✓</div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="card admin-card text-sm text-gray-600">Velg en kamp for å vise hendelser.</div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl bg-black shadow-soft overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-black/60 text-white/90 hover:text-white"
              aria-label="Close preview"
            >
              ✕
            </button>
            <img
              src={previewUrl}
              alt="Story preview"
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-wide">Live Lokal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupEventsByMatch(events: MatchEvent[]) {
  return events.reduce<Record<string, MatchEvent[]>>((acc, event) => {
    const key = event.objectId_match || 'Ukjent match';
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

async function createEventOverlayPng(event: MatchEvent) {
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

  const hendelseY = canvas.height * 0.72;
  const draktY = canvas.height * 0.78;
  const tidspunktY = canvas.height * 0.84;

  ctx.lineWidth = 4;
  ctx.font = 'bold 104px sans-serif';
  ctx.strokeText(event.hendelse, canvas.width / 2, hendelseY);
  ctx.fillText(event.hendelse, canvas.width / 2, hendelseY);

  ctx.lineWidth = 4;
  ctx.font = '68px sans-serif';
  ctx.strokeText(event.draktnummer, canvas.width / 2, draktY);
  ctx.fillText(event.draktnummer, canvas.width / 2, draktY);

  ctx.lineWidth = 3;
  ctx.font = '56px sans-serif';
  ctx.strokeText(event.tidspunkt, canvas.width / 2, tidspunktY);
  ctx.fillText(event.tidspunkt, canvas.width / 2, tidspunktY);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png');
  });
}
