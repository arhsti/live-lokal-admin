import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import Header from '../../components/Header';

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
    <div>
      <Header title="Admin" />
      <main className="container-base space-y-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Oversikt</h1>
          <p className="text-base text-gray-600">Velg område for å administrere innhold.</p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card admin-card-large shadow-soft flex flex-col gap-6 transition-transform hover:-translate-y-1 hover:border-gray-300">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-900 flex items-center justify-center">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Bilder</h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {imageCount === null ? '—' : `${imageCount} bilder`}
                </div>
              </div>
              <p className="text-sm text-gray-600">Last opp og administrer bilder som brukes i stories.</p>
            </div>
            <div className="mt-auto flex justify-end">
              <Link href="/admin/images" className="btn-primary inline-block no-underline whitespace-nowrap">
                Åpne bilder
              </Link>
            </div>
          </div>

          <div className="card admin-card-large shadow-soft flex flex-col gap-6 transition-transform hover:-translate-y-1 hover:border-gray-300">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-900 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Hendelser</h2>
              <p className="text-sm text-gray-600">Motta og publiser kamp-hendelser.</p>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-flex">
                {matchCount === null ? '—' : `${matchCount} aktive kamper`}
              </div>
            </div>
            <div className="mt-auto flex justify-end">
              <Link href="/admin/hendelser" className="btn-primary inline-block no-underline whitespace-nowrap">
                Administrer hendelser
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
