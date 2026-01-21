import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/components/ui/utils';
import { container, header as headerTokens } from '@/styles/tokens';

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
    <header className={headerTokens.wrapper}>
      <div className={cn(container.header, headerTokens.inner)}>
        <Link href="/admin" className={headerTokens.brand}>
          {clubName ? `Live Lokal – ${clubName}` : (club ? `Live Lokal – Klubb ${club}` : 'Live Lokal')}
        </Link>
        <div className={headerTokens.title}>{title}</div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={headerTokens.menuButton}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            ☰
          </button>
          {menuOpen && (
            <div className={headerTokens.menu} role="menu">
              <Link
                href="/admin/innstillinger"
                className={headerTokens.menuItem}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Innstillinger
              </Link>
              <button
                type="button"
                className={headerTokens.menuItemButton}
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
