import Link from 'next/link';
import Header from '../../components/Header';

export default function Admin() {
  return (
    <div>
      <h1>ADMIN DASHBOARD — ACTIVE</h1>
      <Header title="Admin" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Velg område for å administrere innhold.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Bilder</h2>
              <p className="text-sm text-gray-600 mt-1">Last opp og administrer bilder som brukes i stories.</p>
            </div>
            <Link href="/admin/images" className="btn-primary inline-block">
              Gå til bilder
            </Link>
          </div>

          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Templates</h2>
              <p className="text-sm text-gray-600 mt-1">Lag maler med tekst og layout for stories.</p>
            </div>
            <button className="btn-secondary opacity-60 cursor-not-allowed" disabled>
              Gå til templates
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Stories</h2>
              <p className="text-sm text-gray-600 mt-1">Oversikt over genererte stories.</p>
            </div>
            <button className="btn-secondary opacity-60 cursor-not-allowed" disabled>
              Se stories
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
