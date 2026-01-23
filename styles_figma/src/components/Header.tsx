import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  pageTitle?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  clubName?: string;
}

export function Header({ pageTitle, onNavigate, onLogout, clubName }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMenuOpen(false);
            }}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            Live Lokal
          </button>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            {pageTitle && (
              <h2 className="text-[#64748B]">{pageTitle}</h2>
            )}
          </div>

          {/* Right: Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed right-6 top-20 z-50 bg-white rounded-xl border border-[#E2E8F0] shadow-lg min-w-[200px] overflow-hidden">
            {clubName && (
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <div className="text-xs uppercase tracking-wide text-[#94A3B8] mb-1">
                  Klubb
                </div>
                <div className="font-medium">{clubName}</div>
              </div>
            )}
            <button
              onClick={() => {
                onNavigate('settings');
                setMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
            >
              Innstillinger
            </button>
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors text-[#EF4444]"
            >
              Logg ut
            </button>
          </div>
        </>
      )}
    </>
  );
}
