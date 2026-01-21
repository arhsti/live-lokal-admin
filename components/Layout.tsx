import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from './ui/utils';
import { container, header } from '@/styles/tokens';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <div className="min-h-screen bg-[hsl(210_20%_98%)] flex flex-col font-sans text-[hsl(220_25%_15%)]">
      <header className={header.wrapper}>
        <div className={cn(container.header, header.inner)}>
          <Link href="/admin" className={cn(header.brand, 'text-[hsl(220_25%_15%)] hover:opacity-80 transition-opacity')}>
            Live Lokal
          </Link>

          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              uiSize="icon"
              className="h-10 w-10 rounded-full hover:bg-[hsl(210_20%_94%)]"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-[hsl(220_25%_15%)]" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 p-2 rounded-xl shadow-soft border border-[hsl(220_13%_91%/0.5)] bg-white">
                <Link
                  href="/admin/innstillinger"
                  className="cursor-pointer rounded-lg focus:bg-[hsl(210_20%_94%)] flex items-center px-3 py-2 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Innstillinger
                </Link>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg focus:bg-[hsl(0_84%_60%/0.1)] text-[hsl(0_84%_60%)] flex items-center px-3 py-2 text-sm w-full"
                  onClick={async () => {
                    setMenuOpen(false);
                    await handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logg ut
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
