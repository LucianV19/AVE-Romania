import React, { useState } from 'react';
import { View, Admin, UserRole } from '../types';
import HomeButton from './shared/HomeButton';

interface AdminAccessViewProps {
  onNavigate: (view: View, user?: Admin) => void;
  onGoHome: () => void;
}

const AdminAccessView: React.FC<AdminAccessViewProps> = ({ onNavigate, onGoHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Te rog completează email și parola');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Demo credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        // Create admin user
        const admin: Admin = {
          id: `admin_${Date.now()}`,
          nume: 'Administrator',
          rol: UserRole.ADMIN,
        };

        // Save to localStorage
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        localStorage.setItem('currentUser', JSON.stringify(admin));

        // Navigate to admin panel
        onNavigate(View.ADMIN, admin);
      } else {
        setError('Email sau parolă incorecte. Demo: admin@example.com / admin123');
      }
    } catch (err) {
      setError('Eroare la conectare. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <HomeButton onNavigate={() => onGoHome()} variant="icon" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🔐 Panou Administrator</h1>
        <p className="text-slate-300">Conectează-te pentru a accesa panoul de administrare</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Administrator
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Parola
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pr-16 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-slate-600/50 transition-colors"
                >
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {loading ? 'Se conectează...' : 'Conectare Administrator'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-emerald-500/20 rounded-lg border border-emerald-600/50">
            <p className="text-xs text-emerald-300 mb-2 font-medium">Demo Credentials:</p>
            <p className="text-xs text-emerald-300">
              Email: <span className="text-emerald-200">admin@example.com</span>
            </p>
            <p className="text-xs text-emerald-300">
              Password: <span className="text-emerald-200">admin123</span>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <p className="text-xs text-slate-400">
              🔒 Aceasta este o platformă de demo. Pentru producție, implementați autentificare securizată cu 2FA.
            </p>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Accesul administratorului este restricționat și monitorizat
        </p>
      </div>
    </div>
  );
};

export default AdminAccessView;
