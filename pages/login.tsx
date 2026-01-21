import { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthLayout, AuthCard } from '@/components/AuthLayout';
import BrandBadge from '@/components/BrandBadge';
import PasswordField from '@/components/PasswordField';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/utils';
import { layout, spacing, typography, status } from '@/styles/tokens';

export default function LoginPage() {
  const router = useRouter();
  const [fiksid, setFiksid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <AuthLayout>
      <AuthCard>
        <div className={cn(layout.col, spacing.stack)}>
          <div className={cn(layout.col, spacing.stackTight)}>
            <BrandBadge text="LL" />
            <div className={cn(layout.col, spacing.field)}>
              <h1 className={typography.cardTitle}>Live Lokal</h1>
              <p className={typography.subtitle}>Automatisk generering og publisering av kamp-hendelser</p>
              <p className={typography.bodyStrong}>Logg inn for å administrere klubben.</p>
            </div>
          </div>
          <form className={spacing.stack} onSubmit={handleSubmit}>
            <div className={cn(layout.col, spacing.field)}>
              <Label>FIKS ID (5 siffer)</Label>
              <Input
                className={layout.wFull}
                value={fiksid}
                onChange={(e) => setFiksid(e.target.value)}
                placeholder="FIKS-ID (5 siffer)"
                inputMode="numeric"
                pattern="\d{5}"
                required
              />
            </div>
            <PasswordField
              label="Passord"
              value={password}
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passord"
            />
            {error && <div className={status.error}>{error}</div>}
            <Button className={layout.wFull} disabled={loading}>
              {loading ? 'Logger inn...' : 'Logg inn'}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
