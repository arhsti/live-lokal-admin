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
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Velg område for å administrere innhold.</p>
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}
        >
          <div className="card admin-card flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Bilder</h2>
                <div className="text-sm text-gray-500">
                  {imageCount === null ? '—' : `Bildebibliotek: ${imageCount} bilder`}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Last opp og administrer bilder som brukes i stories.</p>
            </div>
            <div className="mt-auto flex justify-end">
              <Link href="/admin/images" className="btn-primary inline-block no-underline whitespace-nowrap">
                Gå til bilder
              </Link>
            </div>
          </div>

          <div className="card admin-card flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold">Hendelser</h2>
              <p className="text-sm text-gray-600 mt-1">Motta og publiser kamp-hendelser.</p>
            </div>
            <div className="mt-auto flex justify-end">
              <Link href="/admin/hendelser" className="btn-primary inline-block no-underline whitespace-nowrap">
                Gå til hendelser
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
