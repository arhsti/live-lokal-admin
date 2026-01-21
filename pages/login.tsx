import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [fiksid, setFiksid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiksid_livelokal: fiksid.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Login failed' }));
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/admin');
    } catch (_e) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-gray-200/70 to-transparent" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gray-300/40 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-gray-200/40 blur-3xl" />

      <div className="card admin-card-large shadow-soft w-full max-w-[400px] space-y-8 box-border bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white font-semibold">
            LL
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Live Lokal</h1>
          <p className="text-sm text-gray-500">Automatisk generering og publisering av kamp-hendelser</p>
          <p className="text-xs text-gray-600">Logg inn for å administrere klubben.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">FIKS ID (5 siffer)</label>
            <input
              className="input w-full mt-2 box-border"
              value={fiksid}
              onChange={(e) => setFiksid(e.target.value)}
              placeholder="FIKS-ID (5 siffer)"
              inputMode="numeric"
              pattern="\d{5}"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Passord</label>
            <input
              type="password"
              className="input w-full mt-2 box-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passord"
              required
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  );
}
