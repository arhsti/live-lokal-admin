import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold mb-4" style={{ color: 'rgb(29 30 31)' }}>Live Lokal</h1>
        <p className="text-gray-600 mb-6">Enkel opplasting og administrasjon av story-bilder.</p>

        <div className="flex justify-center">
          <Link href="/login" className="btn-accent px-6 py-3 rounded-lg font-medium">Logg inn</Link>
        </div>
      </div>
    </main>
  );
}
