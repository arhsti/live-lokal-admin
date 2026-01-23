import { Image, Activity } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  imageCount: number;
  eventCount: number;
}

export function Dashboard({ onNavigate, imageCount, eventCount }: DashboardProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bilder Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#F0F9FF] rounded-lg">
              <Image size={28} className="text-[#0EA5E9]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Bilder</h3>
              <p className="text-[#64748B] text-sm">
                Bildebibliotek for kamp-hendelser
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-2xl mb-1">{imageCount}</div>
            <div className="text-sm text-[#94A3B8]">bilder tilgjengelig</div>
          </div>

          <button
            onClick={() => onNavigate('images')}
            className="w-full bg-[#0EA5E9] text-white py-3 rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Åpne
          </button>
        </div>

        {/* Hendelser Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#F0FDF4] rounded-lg">
              <Activity size={28} className="text-[#10B981]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Hendelser</h3>
              <p className="text-[#64748B] text-sm">
                Sanntidsdata fra kamp
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-2xl mb-1">{eventCount}</div>
            <div className="text-sm text-[#94A3B8]">aktive hendelser</div>
          </div>

          <button
            onClick={() => onNavigate('events')}
            className="w-full bg-[#10B981] text-white py-3 rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Åpne
          </button>
        </div>
      </div>
    </div>
  );
}
