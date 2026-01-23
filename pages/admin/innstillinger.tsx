import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Settings } from '@/components/Settings';

export default function InnstillingerPage() {
  const [clubId, setClubId] = useState('');
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/club');
      if (res.ok) {
        const data = await res.json();
        setClubId(data?.fiksid_livelokal || '');
        setClubName(data?.clubName || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClubName(name: string) {
    try {
      const res = await fetch('/api/club-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubName: name }),
      });
      
      if (res.ok) {
        setClubName(name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Innstillinger" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#64748B]">Laster...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Innstillinger" />
      <main>
        <Settings
          clubId={clubId}
          clubName={clubName}
          onUpdateClubName={handleUpdateClubName}
        />
      </main>
    </>
  );
}
