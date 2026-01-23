import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Events } from '@/components/Events';
import StoryPreviewModal from '@/components/StoryPreviewModal';

interface MatchEvent {
  id: string;
  eventType: 'goal' | 'yellow' | 'red' | 'substitute';
  time: string;
  jerseyNumber: string;
  status: 'draft' | 'published';
  playerName?: string;
  imageUrl?: string;
}

interface Match {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  events: MatchEvent[];
}

interface StoryPreview {
  eventType: string;
  time: string;
  score: string;
  imageUrl: string;
  jerseyNumber: string;
  playerName?: string;
  teamName: string;
}

export default function HendelserPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyPreview, setStoryPreview] = useState<StoryPreview | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      
      const data = await res.json();
      const rawEvents = Array.isArray(data) ? data : [];
      
      // Group events by match
      const matchMap = new Map<string, any>();
      
      rawEvents.forEach((event: any) => {
        const matchId = event.objectId_match || 'unknown';
        
        if (!matchMap.has(matchId)) {
          matchMap.set(matchId, {
            id: matchId,
            name: 'Eliteserien - Runde 15', // TODO: Get from API
            homeTeam: 'Hjemmelag', // TODO: Get from API
            awayTeam: 'Bortelag', // TODO: Get from API
            homeScore: 0, // TODO: Get from API
            awayScore: 0, // TODO: Get from API
            status: event.tidspunkt === 'FT' ? 'finished' : 'live',
            events: [],
          });
        }
        
        const match = matchMap.get(matchId);
        match.events.push({
          id: event.id,
          eventType: mapEventType(event.hendelse),
          time: event.tidspunkt,
          jerseyNumber: event.draktnummer,
          status: event.status === 'posted' ? 'published' : 'draft',
          playerName: undefined, // TODO: Get from API
          imageUrl: event.renderedImageUrl || undefined,
        });
      });
      
      setMatches(Array.from(matchMap.values()));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function mapEventType(hendelse: string): 'goal' | 'yellow' | 'red' | 'substitute' {
    const lower = hendelse.toLowerCase();
    if (lower.includes('mål') || lower.includes('goal')) return 'goal';
    if (lower.includes('gult') || lower.includes('yellow')) return 'yellow';
    if (lower.includes('rødt') || lower.includes('red')) return 'red';
    if (lower.includes('bytte') || lower.includes('substitute')) return 'substitute';
    return 'goal';
  }

  const handleViewStory = (event: MatchEvent, match: Match) => {
    setStoryPreview({
      eventType: event.eventType,
      time: event.time,
      score: `${match.homeScore} - ${match.awayScore}`,
      imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1657957746418-6a38df9e1ea7?w=1080',
      jerseyNumber: event.jerseyNumber,
      playerName: event.playerName,
      teamName: match.homeTeam,
    });
  };

  const handlePostStory = async (eventId: string) => {
    try {
      const res = await fetch('/api/events/post-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        setMatches((prev) =>
          prev.map((match) => ({
            ...match,
            events: match.events.map((evt) =>
              evt.id === eventId ? { ...evt, status: 'published' as const } : evt
            ),
          }))
        );
        alert('Story publisert til Instagram!');
      } else {
        alert('Kunne ikke publisere story');
      }
    } catch (error) {
      console.error(error);
      alert('En feil oppstod');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Hendelser" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#64748B]">Laster...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Hendelser" />
      <main>
        <Events
          matches={matches}
          onViewStory={handleViewStory}
          onPostStory={handlePostStory}
        />
      </main>

      {/* Story Preview Modal */}
      {storyPreview && (
        <StoryPreviewModal
          isOpen={true}
          onClose={() => setStoryPreview(null)}
          eventType={storyPreview.eventType}
          time={storyPreview.time}
          score={storyPreview.score}
          imageUrl={storyPreview.imageUrl}
          jerseyNumber={storyPreview.jerseyNumber}
          playerName={storyPreview.playerName}
          teamName={storyPreview.teamName}
        />
      )}
    </>
  );
}
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
