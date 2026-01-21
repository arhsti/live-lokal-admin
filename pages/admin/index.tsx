import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function Admin() {
  const [imageCount, setImageCount] = useState<number | null>(null);

  useEffect(() => {
    loadImageCount();
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

  return (
    <div>
      <Header title="Admin" />
      <main className="container-base space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Oversikt</h1>
          <p className="text-base text-gray-600">Velg område for å administrere innhold.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="card admin-card-large shadow-soft flex flex-col gap-6">
            <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
              B
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

          <div className="card admin-card-large shadow-soft flex flex-col gap-6">
            <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
              H
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Hendelser</h2>
              <p className="text-sm text-gray-600">Motta og publiser kamp-hendelser.</p>
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
