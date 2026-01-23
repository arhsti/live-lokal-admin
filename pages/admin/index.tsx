import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';

export default function Admin() {
  const [imageCount, setImageCount] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);

  useEffect(() => {
    loadImageCount();
    loadEventCount();
  }, []);

  async function loadImageCount() {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) return;
      const data = await res.json();
      setImageCount(Array.isArray(data) ? data.length : 0);
    } catch (_e) {
      setImageCount(0);
    }
  }

  async function loadEventCount() {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setEventCount(data.length);
    } catch (_e) {
      setEventCount(0);
    }
  }

  return (
    <>
      <Header title="Dashboard" />
      <main>
        <Dashboard imageCount={imageCount} eventCount={eventCount} />
      </main>
    </>
  );
}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8">
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
