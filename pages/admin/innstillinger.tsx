import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Settings } from '@/components/Settings';

export default function InnstillingerPage() {
  const [clubId, setClubId] = useState('');
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/club');
      if (res.ok) {
        const data = await res.json();
        setClubId(data?.fiksid_livelokal || '');
        setClubName(data?.clubName || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClubName(name: string) {
    try {
      const res = await fetch('/api/club-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubName: name }),
      });
      
      if (res.ok) {
        setClubName(name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Innstillinger" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#64748B]">Laster...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Innstillinger" />
      <main>
        <Settings
          clubId={clubId}
          clubName={clubName}
          onUpdateClubName={handleUpdateClubName}
        />
      </main>
    </>
  );
}
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
