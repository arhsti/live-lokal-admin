import { useEffect, useState } from 'react';
import Header from '../../components/Header';

interface MatchEvent {
  id: string;
  hendelse: string;
  tidspunkt: string;
  draktnummer: string;
  createdAt: string;
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

      const res = await fetch('/api/events/post-story', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({ success: false, error: 'Publisering feilet' }));
      if (!res.ok || data.success === false) {
        setPostErrors(prev => ({ ...prev, [event.id]: data.error || 'Publisering feilet' }));
        return;
      }

      setPostSuccess(prev => ({ ...prev, [event.id]: true }));
      setTimeout(() => setPostSuccess(prev => ({ ...prev, [event.id]: false })), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publisering feilet';
      setPostErrors(prev => ({ ...prev, [event.id]: message }));
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
          <div className="card p-4">
            {events.length === 0 ? (
              <div className="text-sm text-gray-600">Ingen hendelser funnet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Hendelse</th>
                      <th className="py-2 pr-4">Tidspunkt</th>
                      <th className="py-2 pr-4">Draktnummer</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-t border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-900">{event.hendelse}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.tidspunkt}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.draktnummer}</td>
                        <td className="py-3 text-right">
                          <button
                            className="btn-primary whitespace-nowrap"
                            onClick={() => handlePost(event)}
                            disabled={!!posting[event.id]}
                          >
                            {posting[event.id] ? 'Sender...' : 'Post story'}
                          </button>
                          {postErrors[event.id] && (
                            <div className="text-xs text-red-500 mt-2">{postErrors[event.id]}</div>
                          )}
                          {postSuccess[event.id] && (
                            <div className="text-xs text-green-600 mt-2">Publisert ✓</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
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
