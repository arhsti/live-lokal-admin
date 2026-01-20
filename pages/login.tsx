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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card w-full max-w-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Live Lokal</h1>
          <p className="text-sm text-gray-600 mt-1">Logg inn for å administrere klubben.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-gray-500">FIKS ID (5 siffer)</label>
            <input
              className="input w-full mt-1"
              value={fiksid}
              onChange={(e) => setFiksid(e.target.value)}
              placeholder="98900"
              inputMode="numeric"
              pattern="\d{5}"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Passord</label>
            <input
              type="password"
              className="input w-full mt-1"
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
