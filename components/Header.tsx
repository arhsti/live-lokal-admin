import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [club, setClub] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/club')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClub(data?.fiksid_livelokal || null);
        setClubName(data?.clubName || null);
      })
      .catch(() => setClub(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="w-full bg-gray-100 border-b border-gray-200">
      <div className="container-base flex items-center justify-between">
        <Link href="/admin" className="text-gray-900 font-semibold link-reset">
          {clubName ? `Live Lokal – ${clubName}` : (club ? `Live Lokal – Klubb ${club}` : 'Live Lokal')}
        </Link>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="flex items-center gap-5">
          <Link href="/admin/innstillinger" className="text-sm text-gray-600 hover:text-gray-900 link-reset">
            Innstillinger
          </Link>
          <button className="text-sm text-gray-600 hover:text-gray-900" onClick={handleLogout}>Logg ut</button>
        </div>
      </div>
    </header>
  );
}
