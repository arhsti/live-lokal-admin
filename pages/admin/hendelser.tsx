import { useEffect, useState } from 'react';
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
      setEvents(Array.isArray(data) ? data : []);
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

  return (
    <div>
      <Header title="Hendelser" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Hendelser</h1>
          <p className="text-sm text-gray-600 mt-1">Oversikt over kamp-hendelser.</p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        {loading ? (
          <div className="text-sm text-gray-600">Laster hendelser...</div>
        ) : (
          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="card p-6 text-sm text-gray-600">Ingen hendelser funnet.</div>
            ) : (
              Object.entries(groupEventsByMatch(events)).map(([matchId, matchEvents]) => (
                <div key={matchId} className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Match: {matchId}</h2>
                      <p className="text-xs text-gray-500">{matchEvents.length} hendelser</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 pr-4">Hendelse</th>
                          <th className="py-2 pr-4">Tidspunkt</th>
                          <th className="py-2 pr-4">Draktnummer</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Preview</th>
                          <th className="py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchEvents.map((event) => {
                          const isPosted = event.status === 'posted';
                          const isPosting = !!posting[event.id];
                          return (
                            <tr key={event.id} className="border-t border-gray-100">
                              <td className="py-3 pr-4 font-medium text-gray-900">{event.hendelse}</td>
                              <td className="py-3 pr-4 text-gray-700">{event.tidspunkt}</td>
                              <td className="py-3 pr-4 text-gray-700">{event.draktnummer}</td>
                              <td className="py-3 pr-4 text-gray-700">{event.status}</td>
                              <td className="py-3 pr-4">
                                {isPosted && event.renderedImageUrl ? (
                                  <img
                                    src={event.renderedImageUrl}
                                    alt="Story"
                                    className="h-12 w-12 rounded-md object-cover"
                                  />
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
                                  {isPosted ? 'Publisert' : (isPosting ? 'Sender...' : 'Post story')}
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
              ))
            )}
          </div>
        )}
      </main>
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
