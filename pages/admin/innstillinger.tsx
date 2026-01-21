import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/utils';
import { layout, spacing, typography, status } from '@/styles/tokens';

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
    <div className={cn(layout.col, spacing.section)}>
      <div className={cn(layout.col, spacing.stackTight)}>
        <h1 className={typography.pageTitle}>Innstillinger</h1>
        <p className={typography.subtitle}>Administrer klubbnavn.</p>
      </div>

      <Card className={layout.maxWlg}>
        <CardContent>
          {loading ? (
            <div className={status.muted}>Laster...</div>
          ) : (
            <form className={spacing.stack} onSubmit={saveSettings}>
              <div className={cn(layout.col, spacing.field)}>
                <Label className={typography.formLabel}>Klubbnavn</Label>
                <Input
                  className={layout.wFull}
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="IL Gneist"
                />
              </div>
              {error && <div className={status.error}>{error}</div>}
              {success && <div className={status.success}>Lagret ✓</div>}
              <Button disabled={saving}>
                {saving ? 'Lagrer...' : 'Lagre'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
