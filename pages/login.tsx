import { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthLayout } from '@/components/AuthLayout';
import BrandBadge from '@/components/BrandBadge';
import PasswordField from '@/components/PasswordField';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/components/ui/utils';
import { layout, typography, status, auth } from '@/styles/tokens';
import { ArrowRight } from 'lucide-react';

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
      <Card className={auth.card}>
        <CardHeader className={cn(layout.textCenter, 'pb-8 pt-8')}>
          <BrandBadge text="LL" />
          <CardTitle className="text-2xl font-bold tracking-tight">Live Lokal</CardTitle>
          <CardDescription className="mt-2 text-balance">
            Automatisk generering og publisering av kamp-hendelser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className={typography.formLabel}>FIKS-ID</Label>
              <Input
                value={fiksid}
                onChange={(e) => setFiksid(e.target.value)}
                placeholder="12345"
                inputMode="numeric"
                pattern="\d{5}"
                required
                uiSize="lg"
                className="bg-[hsl(210_20%_94%/0.3)] border-transparent focus:border-[hsl(220_25%_15%/0.2)] focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <PasswordField
                label="Passord"
                value={password}
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <div className={status.error}>{error}</div>}
            <Button
              type="submit"
              uiSize="lg"
              className="w-full text-base font-medium shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Logg inn...' : 'Logg inn'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-8 text-center text-xs text-[hsl(220_10%_55%)]">
        &copy; 2026 Live Lokal AS. Alle rettigheter reservert.
      </div>
    </AuthLayout>
  );
}
