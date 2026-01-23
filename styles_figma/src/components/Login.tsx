import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (clubId: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [clubId, setClubId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      onLogin(clubId, password);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
      <div className="w-full max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-3">Live Lokal</h1>
          <p className="text-[#64748B] text-sm">
            Automatisk generering og publisering av kamp-hendelser
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Club ID Input */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
              Klubb-ID (FIKS-ID)
            </label>
            <input
              type="text"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              placeholder="12345"
              maxLength={5}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
              Passord
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#64748B] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !clubId || !password}
            className="w-full bg-[#0EA5E9] text-white py-3 rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  );
}
