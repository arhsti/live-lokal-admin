import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Live lokal</h1>
        <p className="text-sm text-gray-600">Admin-innlogging og verktøy.</p>
        <Link href="/admin" className="btn-primary inline-block">Gå til admin</Link>
      </div>
    </main>
  );
}
