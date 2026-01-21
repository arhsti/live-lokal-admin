import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Admin() {
  const [imageCount, setImageCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  useEffect(() => {
    loadImageCount();
    loadMatchCount();
  }, []);

  async function loadImageCount() {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) return;
      const data = await res.json();
      setImageCount(Array.isArray(data) ? data.length : null);
    } catch (_e) {
      setImageCount(null);
    }
  }

  async function loadMatchCount() {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const ids = new Set<string>();
      data.forEach((event) => {
        if (typeof event?.objectId_match === 'string' && event.objectId_match.trim()) {
          ids.add(event.objectId_match.trim());
        }
      });
      setMatchCount(ids.size);
    } catch (_e) {
      setMatchCount(null);
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(220_25%_15%)]">Oversikt</h1>
        <p className="text-[hsl(220_10%_55%)] text-sm">Velkommen tilbake, Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
        <Link href="/admin/images" className="block">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-[hsl(220_13%_91%/0.6)] hover:border-[hsl(220_25%_15%/0.2)] h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col items-start space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)] flex items-center justify-center">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold group-hover:text-[hsl(220_25%_15%)] transition-colors">Bilder</h2>
                <p className="text-[hsl(220_10%_55%)] text-sm">
                  Administrer bildebiblioteket, last opp nye bilder og koble dem til spillere.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
              <span className="text-xs font-medium bg-[hsl(210_20%_94%)] px-3 py-1 rounded-full text-[hsl(220_25%_15%)]">
                {imageCount === null ? '—' : `${imageCount} bilder`}
              </span>
              <Button
                variant="ghost"
                className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent text-[hsl(220_25%_15%)] text-sm font-semibold"
              >
                Åpne <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/hendelser" className="block">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-[hsl(220_13%_91%/0.6)] hover:border-[hsl(220_25%_15%/0.2)] h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col items-start space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)] flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold group-hover:text-[hsl(220_25%_15%)] transition-colors">Hendelser</h2>
                <p className="text-[hsl(220_10%_55%)] text-sm">
                  Se kampoversikt, rediger hendelser og publiser stories direkte.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
              <span className="text-xs font-medium bg-[hsl(210_20%_94%)] px-3 py-1 rounded-full text-[hsl(220_25%_15%)]">
                {matchCount === null ? '—' : `${matchCount} aktive kamper`}
              </span>
              <Button
                variant="ghost"
                className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent text-[hsl(220_25%_15%)] text-sm font-semibold"
              >
                Administrer <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
}
