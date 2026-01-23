import { Login } from '@/components/Login';

export default function LoginPage() {
  return <Login />;
}
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
