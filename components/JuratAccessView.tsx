import React, { useState } from 'react';
import { View, Jurat, UserRole } from '../types';

interface JuratAccessViewProps {
  onNavigate: (view: View, user?: Jurat) => void;
  onGoHome: () => void;
}

const JuratAccessView: React.FC<JuratAccessViewProps> = ({ onNavigate, onGoHome }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulated login - in real app would call API
    try {
      if (!loginEmail || !loginPassword) {
        setError('Te rog completează email și parola');
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create mock jurat
      const jurat: Jurat = {
        id: `jurat_${Date.now()}`,
        nume: loginEmail.split('@')[0],
        rol: UserRole.JUDGE,
      };

      // Save to localStorage
      localStorage.setItem('currentJurat', JSON.stringify(jurat));
      localStorage.setItem('currentUser', JSON.stringify(jurat));

      // Navigate to judge panel
      onNavigate(View.JUDGE, jurat);
    } catch (err) {
      setError('Eroare la conectare. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setError('Te rog completează toate câmpurile');
      setLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Parolele nu coincid');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create new jurat
      const jurat: Jurat = {
        id: `jurat_${Date.now()}`,
        nume: signupName,
        rol: UserRole.JUDGE,
      };

      // Save to localStorage
      localStorage.setItem('currentJurat', JSON.stringify(jurat));
      localStorage.setItem('currentUser', JSON.stringify(jurat));

      // Navigate to judge panel
      onNavigate(View.JUDGE, jurat);
    } catch (err) {
      setError('Eroare la înregistrare. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Back to Home Button */}
      <button
        onClick={onGoHome}
        className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
      >
        ← Înapoi acasă
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">⚖️ Panou Jurat</h1>
        <p className="text-slate-300">Conectează-te sau înregistrează-te pentru a fi jurat</p>
      </div>

      {/* Login/Signup Card */}
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Conectare
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Înregistrare
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Parola
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {loading ? 'Se conectează...' : 'Conectare'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nume complet
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Ion Popescu"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Parola
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmă parola
                  </label>
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {loading ? 'Se înregistrează...' : 'Înregistrare'}
                </button>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-xs text-slate-400 mb-2 font-medium">Demo Credentials:</p>
              <p className="text-xs text-slate-400">
                Email: <span className="text-slate-300">demo@jurat.ro</span>
              </p>
              <p className="text-xs text-slate-400">
                Password: <span className="text-slate-300">demo123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Prin conectare accepti Termenii și Condițiile noastre
        </p>
      </div>
    </div>
  );
};

export default JuratAccessView;
