import { useState } from 'react';

interface SettingsProps {
  clubId: string;
  clubName: string;
  onUpdateClubName: (name: string) => void;
}

export function Settings({ clubId, clubName, onUpdateClubName }: SettingsProps) {
  const [name, setName] = useState(clubName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setSaved(false);
    
    setTimeout(() => {
      onUpdateClubName(name);
      setIsSaving(false);
      setSaved(true);
      
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Innstillinger</h1>
        <p className="text-[#64748B]">
          Administrer klubbinformasjon og innstillinger
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 space-y-6">
        {/* Club ID (Read-only) */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
            Klubb-ID (FIKS-ID)
          </label>
          <input
            type="text"
            value={clubId}
            readOnly
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#64748B] cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-[#94A3B8]">
            Klubb-ID kan ikke endres
          </p>
        </div>

        {/* Club Display Name */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
            Klubbnavn (visningsnavn)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="F.eks. Fotballklubben Viking"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
          />
          <p className="mt-2 text-sm text-[#94A3B8]">
            Dette navnet vises i grensesnittet og på publiserte stories
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || name === clubName}
            className="px-6 py-3 bg-[#0EA5E9] text-white rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </button>
          
          {saved && (
            <span className="text-sm text-[#10B981] font-medium">
              ✓ Endringer lagret
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
