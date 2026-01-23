import { useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ImageLibrary } from './components/ImageLibrary';
import { Events } from './components/Events';
import { StoryPreviewModal } from './components/StoryPreviewModal';
import { Settings } from './components/Settings';

type Page = 'login' | 'dashboard' | 'images' | 'events' | 'settings';

interface ImageData {
  id: string;
  url: string;
  description: string;
  jerseyNumber: string;
  eventType: string;
}

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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [clubId, setClubId] = useState('');
  const [clubName, setClubName] = useState('');
  const [storyPreview, setStoryPreview] = useState<StoryPreview | null>(null);

  // Mock data for images
  const [images, setImages] = useState<ImageData[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1657957746418-6a38df9e1ea7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMGFjdGlvbnxlbnwxfHx8fDE3NjkxNzkxNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Spiller i aksjon',
      jerseyNumber: '10',
      eventType: 'goal',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1671245166799-9639823eb9b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBnb2Fsa2VlcGVyJTIwc2F2ZXxlbnwxfHx8fDE3NjkxNTc1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Keeper med redning',
      jerseyNumber: '1',
      eventType: 'goal',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1763751626851-024987c2f778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMG1hdGNoJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY5MTg4Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Målfeiring',
      jerseyNumber: '9',
      eventType: 'goal',
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1752681304960-bd4e018a04bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjB0ZWFtJTIwcGxheWVyc3xlbnwxfHx8fDE3NjkxODgzODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Lag-foto',
      jerseyNumber: '7',
      eventType: 'substitute',
    },
  ]);

  // Mock data for matches and events
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'match-1',
      name: 'Eliteserien - Runde 15',
      homeTeam: 'Fotballklubben Viking',
      awayTeam: 'Strømsgodset IF',
      homeScore: 2,
      awayScore: 1,
      status: 'live',
      events: [
        {
          id: 'evt-1',
          eventType: 'goal',
          time: '23',
          jerseyNumber: '10',
          status: 'published',
          playerName: 'Ole Hansen',
          imageUrl: images[0].url,
        },
        {
          id: 'evt-2',
          eventType: 'yellow',
          time: '34',
          jerseyNumber: '5',
          status: 'draft',
          playerName: 'Erik Johansen',
          imageUrl: images[1].url,
        },
        {
          id: 'evt-3',
          eventType: 'goal',
          time: '67',
          jerseyNumber: '9',
          status: 'draft',
          playerName: 'Lars Pedersen',
          imageUrl: images[2].url,
        },
      ],
    },
    {
      id: 'match-2',
      name: '2. divisjon - Runde 8',
      homeTeam: 'Fotballklubben Viking 2',
      awayTeam: 'Vålerenga 2',
      homeScore: 1,
      awayScore: 1,
      status: 'finished',
      events: [
        {
          id: 'evt-4',
          eventType: 'goal',
          time: '45',
          jerseyNumber: '7',
          status: 'published',
          playerName: 'Martin Berg',
          imageUrl: images[3].url,
        },
      ],
    },
  ]);

  const handleLogin = (id: string, password: string) => {
    setClubId(id);
    setClubName(`Fotballklubben ${id}`);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setClubId('');
    setClubName('');
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleUpload = () => {
    alert('Last opp bilde-funksjonalitet vil bli implementert');
  };

  const handleUpdateImage = (id: string, data: Partial<ImageData>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...data } : img))
    );
  };

  const handleUseInStory = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      alert(`Bildet for spiller #${image.jerseyNumber} er nå klart for bruk i story`);
    }
  };

  const handlePostStoryFromImage = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      alert(`Story publisert for spiller #${image.jerseyNumber}!`);
    }
  };

  const handleViewStory = (event: MatchEvent, match: Match) => {
    setStoryPreview({
      eventType: event.eventType,
      time: event.time,
      score: `${match.homeScore} - ${match.awayScore}`,
      imageUrl: event.imageUrl || images[0].url,
      jerseyNumber: event.jerseyNumber,
      playerName: event.playerName,
      teamName: match.homeTeam,
    });
  };

  const handlePostStory = (eventId: string) => {
    setMatches((prev) =>
      prev.map((match) => ({
        ...match,
        events: match.events.map((evt) =>
          evt.id === eventId ? { ...evt, status: 'published' as const } : evt
        ),
      }))
    );
    alert('Story publisert til Instagram!');
  };

  const handleUpdateClubName = (name: string) => {
    setClubName(name);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'images':
        return 'Bildebibliotek';
      case 'events':
        return 'Hendelser';
      case 'settings':
        return 'Innstillinger';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'login' ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header
            pageTitle={getPageTitle()}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            clubName={clubName}
          />
          <main>
            {currentPage === 'dashboard' && (
              <Dashboard
                onNavigate={handleNavigate}
                imageCount={images.length}
                eventCount={matches.reduce(
                  (total, match) => total + match.events.length,
                  0
                )}
              />
            )}
            {currentPage === 'images' && (
              <ImageLibrary
                images={images}
                onUpload={handleUpload}
                onUpdateImage={handleUpdateImage}
                onUseInStory={handleUseInStory}
                onPostStory={handlePostStoryFromImage}
              />
            )}
            {currentPage === 'events' && (
              <Events
                matches={matches}
                onViewStory={handleViewStory}
                onPostStory={handlePostStory}
              />
            )}
            {currentPage === 'settings' && (
              <Settings
                clubId={clubId}
                clubName={clubName}
                onUpdateClubName={handleUpdateClubName}
              />
            )}
          </main>
        </>
      )}

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
    </div>
  );
}

export default App;
