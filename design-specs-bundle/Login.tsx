import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-secondary/50 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-[400px] border-border/60 shadow-soft bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto mb-4 h-12 w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-heading font-bold text-xl">
            LL
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Live Lokal</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-balance">
            Automatisk generering og publisering av kamp-hendelser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fiks-id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                FIKS-ID
              </Label>
              <Input 
                id="fiks-id" 
                placeholder="12345" 
                className="h-11 bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-white transition-all font-mono"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Passord
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-11 bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all" 
              disabled={loading}
            >
              {loading ? "Logg inn..." : "Logg inn"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-8 text-center text-xs text-muted-foreground">
        &copy; 2026 Live Lokal AS. Alle rettigheter reservert.
      </div>
    </div>
  );
}
