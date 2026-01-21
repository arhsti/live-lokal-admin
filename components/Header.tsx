import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [club, setClub] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/club')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClub(data?.fiksid_livelokal || null);
        setClubName(data?.clubName || null);
      })
      .catch(() => setClub(null));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="w-full bg-white/80 border-b border-gray-200 backdrop-blur">
      <div className="container-base flex items-center justify-between py-4">
        <Link href="/admin" className="text-gray-900 font-semibold tracking-tight link-reset">
          {clubName ? `Live Lokal – ${clubName}` : (club ? `Live Lokal – Klubb ${club}` : 'Live Lokal')}
        </Link>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-xl text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-200/60 transition"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            ☰
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-200 bg-white shadow-soft py-2"
              role="menu"
            >
              <Link
                href="/admin/innstillinger"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 link-reset"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Innstillinger
              </Link>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                role="menuitem"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
              >
                Logg ut
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
