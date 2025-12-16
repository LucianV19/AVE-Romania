import React from 'react';
import { View } from '../types';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const handleDirectorClick = () => {
    // Redirect to formular app
    window.location.href = '/formular/';
  };

  const handleJuratClick = () => {
    // Navigate to Jurat view with login/signup
    onNavigate(View.JURAT_ACCESS);
  };

  const handleAdminClick = () => {
    // Navigate to Admin view
    onNavigate(View.ADMIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🏆 Gala Directorilor Anului
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl">
          Platforma de jurizare și evaluare pentru Gala Directorilor Anului din România
        </p>
      </div>

      {/* Main Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Director Button */}
        <button
          onClick={handleDirectorClick}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-6xl mb-4">📋</div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Formular Director
            </h2>
            
            <p className="text-blue-100 text-sm mb-6">
              Completează formularul de candidatură pentru a participa la Gala Directorilor Anului
            </p>
            
            <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-blue-100 text-sm font-medium backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              Înregistrare Director
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Jurat Button */}
        <button
          onClick={handleJuratClick}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-6xl mb-4">⚖️</div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Panou Jurat
            </h2>
            
            <p className="text-purple-100 text-sm mb-6">
              Conectează-te ca jurat pentru a evalua candidații și accesează panoul de jurizare
            </p>
            
            <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-purple-100 text-sm font-medium backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              Login / Înregistrare
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Admin Button */}
        <button
          onClick={handleAdminClick}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-6xl mb-4">🔐</div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Panou Administrator
            </h2>
            
            <p className="text-emerald-100 text-sm mb-6">
              Administrează competiția, vizualizează candidații și manage rezultatele finale
            </p>
            
            <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-emerald-100 text-sm font-medium backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              Acces Administrator
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-semibold text-white mb-2">Transparent</h3>
          <p className="text-slate-300 text-sm">
            Sistem transparent și echitabil de evaluare a tuturor candidaților
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-2">Profesional</h3>
          <p className="text-slate-300 text-sm">
            Platformă profesională pentru gestionarea competițiilor și jurizării
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">Securizat</h3>
          <p className="text-slate-300 text-sm">
            Date și informații protejate cu siguranță maximă
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-slate-400 text-sm">
        <p>© 2025 Gala Directorilor Anului. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
};

export default HomeView;
