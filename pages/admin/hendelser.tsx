import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import StoryPreviewModal from '@/components/StoryPreviewModal';
import EventTypeDot from '@/components/EventTypeDot';
import { Card, CardContent } from '@/components/ui/Card';
import { EventGrid } from '@/components/ui/Grid';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DividerRow } from '@/components/ui/DividerRow';
import { PulseDot } from '@/components/ui/PulseDot';
import { Table, TableHead, TableBody, TableRow, TableHeaderRow, TableHeaderCell, TableCell } from '@/components/ui/Table';
import { cn } from '@/components/ui/utils';
import { container, layout, spacing, typography, status } from '@/styles/tokens';

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

  return (
    <div>
      <Header title="Hendelser" />
      <main className={cn(container.base, spacing.sectionXXL)}>
        <div className={cn(layout.col, spacing.stackTight)}>
          <h1 className={typography.pageTitle}>Hendelser</h1>
          <p className={typography.lead}>Oversikt over kamp-hendelser.</p>
        </div>

        {error && <div className={status.error}>{error}</div>}

        {loading ? (
          <div className={status.muted}>Laster hendelser...</div>
        ) : (
          <div className={cn(layout.col, spacing.sectionMega)}>
            {events.length === 0 ? (
              <Card>
                <CardContent className={status.muted}>Ingen hendelser funnet.</CardContent>
              </Card>
            ) : (
              <>
                <EventGrid>
                  {Object.entries(groupedEvents).map(([matchId, matchEvents]) => {
                    const isActive = activeMatchId === matchId;
                    return (
                      <SelectableCard
                        key={matchId}
                        type="button"
                        active={isActive}
                        onClick={() => setActiveMatchId(isActive ? null : matchId)}
                      >
                        <CardContent className={cn(layout.col, spacing.gap6)}>
                          <div className={cn(layout.rowBetween, spacing.gap6)}>
                            <div className={cn(layout.col, spacing.field)}>
                              <div className={typography.label}>Match</div>
                              <div className={typography.cardTitle}>{matchId}</div>
                            </div>
                            <Badge>{matchEvents.length} hendelser</Badge>
                          </div>
                          <DividerRow>
                            <span className={cn(layout.row, spacing.inlineTight)}>
                              {isActive ? 'Skjul hendelser' : 'Vis hendelser'}
                              {!isActive && <PulseDot />}
                            </span>
                            <span>→</span>
                          </DividerRow>
                        </CardContent>
                      </SelectableCard>
                    );
                  })}
                </EventGrid>

                {activeMatchId ? (
                  <Card>
                    <CardContent className={cn(layout.col, spacing.stack)}>
                      <div className={cn(layout.rowBetween, spacing.inline)}>
                        <div>
                          <h2 className={typography.bodyStrong}>Match: {activeMatchId}</h2>
                          <p className={typography.subtitle}>{groupedEvents[activeMatchId]?.length || 0} hendelser</p>
                        </div>
                      </div>
                      <div className={layout.overflowXAuto}>
                        <Table>
                          <TableHead>
                            <TableHeaderRow>
                              <TableHeaderCell>Hendelse</TableHeaderCell>
                              <TableHeaderCell>Tidspunkt</TableHeaderCell>
                              <TableHeaderCell>Draktnummer</TableHeaderCell>
                              <TableHeaderCell>Status</TableHeaderCell>
                              <TableHeaderCell align="center">Preview</TableHeaderCell>
                              <TableHeaderCell align="center" padded={false}>Action</TableHeaderCell>
                            </TableHeaderRow>
                          </TableHead>
                          <TableBody>
                            {(groupedEvents[activeMatchId] || []).map((event) => {
                              const isPosted = event.status === 'posted';
                              const isPosting = !!posting[event.id];
                              return (
                                <TableRow key={event.id}>
                                  <TableCell>
                                    <div className={cn(layout.row, spacing.inlineTight)}>
                                      <EventTypeDot type={event.hendelse} />
                                      <span>{event.hendelse}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className={typography.mono}>{event.tidspunkt}</TableCell>
                                  <TableCell className={typography.bodyStrong}>#{event.draktnummer}</TableCell>
                                  <TableCell>
                                    {isPosted ? (
                                      <Badge variant="success">Publisert</Badge>
                                    ) : (
                                      <Badge variant="outline">Utkast</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    {isPosted && event.renderedImageUrl ? (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => openPreview(event.renderedImageUrl)}
                                      >
                                        View story
                                      </Button>
                                    ) : (
                                      <span className={status.muted}>—</span>
                                    )}
                                  </TableCell>
                                  <TableCell align="center" padded={false}>
                                    <Button
                                      onClick={() => handlePost(event)}
                                      disabled={isPosting || isPosted}
                                    >
                                      {isPosted ? 'Posted ✓' : (isPosting ? 'Sender...' : 'Post')}
                                    </Button>
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
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className={status.muted}>Velg en kamp for å vise hendelser.</CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <StoryPreviewModal open={!!previewUrl} imageUrl={previewUrl} onClose={closePreview} fit="contain" />
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
