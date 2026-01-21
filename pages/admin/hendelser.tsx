import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, Eye, Send, CheckCircle2 } from 'lucide-react';
import StoryPreviewModal from '@/components/StoryPreviewModal';
import EventTypeDot from '@/components/EventTypeDot';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableHead, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@/components/ui/Table';
import { status, icon } from '@/styles/tokens';

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
  const [previewMeta, setPreviewMeta] = useState<{
    badgeText?: string;
    title?: string;
    subtitle?: string;
    footerTitle?: string;
  } | null>(null);
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

  const openPreview = (event: MatchEvent) => {
    if (!event.renderedImageUrl) return;
    setPreviewUrl(event.renderedImageUrl);
    setPreviewMeta({
      badgeText: `${event.tidspunkt} • ${event.hendelse.toUpperCase()}`,
      title: `Spiller #${event.draktnummer}`,
      subtitle: `#${event.draktnummer}`,
      footerTitle: 'Live Lokal IL',
    });
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewMeta(null);
  };

  const groupedEvents = useMemo(() => groupEventsByMatch(events), [events]);

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="outline" uiSize="icon" className="h-10 w-10 rounded-full">
            <ChevronLeft className={icon.md} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hendelser</h1>
          <p className="text-[hsl(220_10%_55%)]">Oversikt over kamper og live-oppdateringer</p>
        </div>
      </div>

      {error && <div className={status.error}>{error}</div>}

      {loading ? (
        <div className={status.muted}>Laster hendelser...</div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {Object.entries(groupedEvents).map(([matchId, matchEvents]) => {
              const isActive = activeMatchId === matchId;
              const firstTime = matchEvents[0]?.tidspunkt || 'FT';
              const isFinished = firstTime === 'FT';
              return (
                <Card
                  key={matchId}
                  className={`cursor-pointer transition-all duration-300 border-2 ${isActive ? 'border-[hsl(220_25%_15%)] ring-2 ring-[hsl(220_25%_15%/0.05)] shadow-md' : 'border-transparent hover:border-[hsl(220_13%_91%)]'}`}
                  onClick={() => setActiveMatchId(isActive ? null : matchId)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[hsl(220_10%_55%)] bg-[hsl(210_20%_94%)] px-2 py-1 rounded-md">
                          Eliteserien
                        </span>
                        <div className="text-sm text-[hsl(220_10%_55%)] font-medium pt-2">
                          {isFinished ? 'Ferdigspilt' : `Spilles nå • ${firstTime}`}
                        </div>
                      </div>
                      {!isFinished && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div className="text-center flex-1">
                        <div className="text-lg font-bold truncate">Hjemme</div>
                      </div>
                      <div className="bg-[hsl(210_20%_94%)] px-4 py-2 rounded-lg font-mono text-2xl font-bold mx-2">
                        {matchId}
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-lg font-bold truncate">Borte</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[hsl(220_13%_91%/0.5)] mt-2">
                      <span className="text-[hsl(220_10%_55%)] font-medium">
                        {matchEvents.length} hendelser registrert
                      </span>
                      <Button
                        variant="ghost"
                        uiSize="sm"
                        className={`gap-2 ${isActive ? 'text-[hsl(220_25%_15%)]' : 'text-[hsl(220_10%_55%)]'}`}
                      >
                        {isActive ? 'Skjul hendelser' : 'Vis hendelser'}
                        {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeMatchId ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <Card className="border-[hsl(220_13%_91%/0.6)] shadow-soft overflow-hidden">
                <Table>
                  <TableHead className="bg-[hsl(210_20%_94%/0.3)]">
                    <TableHeaderRow className="hover:bg-transparent">
                      <TableHeaderCell className="w-[100px]">Tid</TableHeaderCell>
                      <TableHeaderCell className="w-[150px]">Type</TableHeaderCell>
                      <TableHeaderCell>Beskrivelse</TableHeaderCell>
                      <TableHeaderCell className="w-[100px]">Status</TableHeaderCell>
                      <TableHeaderCell className="w-[120px] text-center">Preview</TableHeaderCell>
                      <TableHeaderCell className="w-[140px] text-center">Handling</TableHeaderCell>
                    </TableHeaderRow>
                  </TableHead>
                  <TableBody>
                    {(groupedEvents[activeMatchId] || []).map((event) => {
                      const isPosted = event.status === 'posted';
                      const isPosting = !!posting[event.id];
                      return (
                        <TableRow key={event.id} className="group">
                          <TableCell className="font-mono font-medium text-lg text-[hsl(220_10%_55%)]">
                            {event.tidspunkt}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <EventTypeDot type={event.hendelse} />
                              <span className="font-semibold">{event.hendelse}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{event.hendelse}</div>
                            <div className="text-sm text-[hsl(220_10%_55%)]">
                              Spiller #{event.draktnummer}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPosted ? 'secondary' : 'outline'} className="font-normal">
                              {isPosted ? 'Publisert' : 'Utkast'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {event.renderedImageUrl ? (
                              <Button
                                variant="ghost"
                                uiSize="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-[hsl(210_20%_94%)]"
                                onClick={() => openPreview(event)}
                              >
                                <Eye className="h-4 w-4 text-[hsl(220_10%_55%)] group-hover:text-[hsl(220_25%_15%)] transition-colors" />
                              </Button>
                            ) : (
                              <span className={status.muted}>—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isPosted ? (
                              <Button disabled variant="ghost" uiSize="sm" className="text-green-600 font-medium">
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Posted
                              </Button>
                            ) : (
                              <Button
                                uiSize="sm"
                                className="w-full bg-[hsl(220_25%_15%)] hover:bg-[hsl(220_25%_15%/0.9)] text-white shadow-sm"
                                onClick={() => handlePost(event)}
                                disabled={isPosting}
                              >
                                <Send className="mr-2 h-3 w-3" /> {isPosting ? 'Sender...' : 'Post'}
                              </Button>
                            )}
                            {postErrors[event.id] && (
                              <div className={status.error}>{postErrors[event.id]}</div>
                            )}
                            {postSuccess[event.id] && (
                              <div className={status.success}>Publisert ✓</div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          ) : null}
        </>
      )}

      <StoryPreviewModal
        open={!!previewUrl}
        imageUrl={previewUrl}
        onClose={closePreview}
        badgeText={previewMeta?.badgeText}
        title={previewMeta?.title}
        subtitle={previewMeta?.subtitle}
        footerTitle={previewMeta?.footerTitle}
      />
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
