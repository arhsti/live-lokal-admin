import { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function InnstillingerPage() {
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/club-settings');
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Kunne ikke hente innstillinger' }));
        setError(data.error || 'Kunne ikke hente innstillinger');
        return;
      }
      const data = await res.json();
      setClubName(data?.clubName || '');
    } catch (_e) {
      setError('Kunne ikke hente innstillinger');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/club-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Kunne ikke lagre' }));
        setError(data.error || 'Kunne ikke lagre');
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (_e) {
      setError('Kunne ikke lagre');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header title="Innstillinger" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Innstillinger</h1>
          <p className="text-sm text-gray-600 mt-1">Administrer klubbnavn.</p>
        </div>

        <div className="card p-6 max-w-lg">
          {loading ? (
            <div className="text-sm text-gray-600">Laster...</div>
          ) : (
            <form className="space-y-4" onSubmit={saveSettings}>
              <div>
                <label className="text-xs text-gray-500">Klubbnavn</label>
                <input
                  className="input w-full mt-1"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="IL Gneist"
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              {success && <div className="text-sm text-green-600">Lagret ✓</div>}
              <button className="btn-primary" disabled={saving}>
                {saving ? 'Lagrer...' : 'Lagre'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
