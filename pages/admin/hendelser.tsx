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
