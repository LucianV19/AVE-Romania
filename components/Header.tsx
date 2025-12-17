import React, { useState } from 'react';
import { View, User } from '../types';
import { MenuIcon, XMarkIcon, HomeIcon } from './shared/icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  isDevMode: boolean;
  setIsDevMode: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser, setCurrentUser, allUsers, isDevMode, setIsDevMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const views: View[] = [View.JUDGE, View.LEADERBOARD, View.ADMIN, View.DOCUMENTATION];

  const handleSetView = (view: View) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/80 dark:border-slate-700 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => handleSetView(View.HOME)}>
             <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-ave-blue to-ave-dark-blue text-white mr-3 shadow-sm">
                <HomeIcon className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-lg font-extrabold text-ave-dark-blue dark:text-slate-100 leading-tight tracking-tight">
                Gala <span className="text-ave-blue">Directorii Anului</span>
                </h1>
             </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-gray-200 dark:border-slate-700">
            {views.map(view => (
                <button
                key={view}
                onClick={() => handleSetView(view)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                    currentView === view
                    ? 'bg-white dark:bg-ave-blue text-ave-blue dark:text-white shadow-sm scale-105'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 hover:text-ave-dark-blue dark:hover:text-white'
                }`}
                >
                {view}
                </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <button
                    onClick={() => handleSetView(View.FORMULAR)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-300 ${
                        currentView === View.FORMULAR
                        ? 'bg-ave-blue text-white shadow-sm'
                        : 'bg-blue-50 text-ave-blue hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700'
                    }`}
                >
                    Director
                </button>
                <button
                    onClick={() => handleSetView(View.JURAT_FORM)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-300 ${
                        currentView === View.JURAT_FORM
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700'
                    }`}
                >
                    Jurat
                </button>
             </div>

             <div className="h-6 w-px bg-gray-300 dark:bg-slate-600"></div>

             <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ave-blue to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                        {currentUser.nume.charAt(0)}
                    </div>
                    <select 
                        value={currentUser.id} 
                        onChange={e => {
                            const selectedUser = allUsers.find(u => u.id === e.target.value);
                            if(selectedUser) {
                                setCurrentUser(selectedUser);
                                localStorage.setItem('currentUser', JSON.stringify(selectedUser));
                            }
                        }}
                        className="text-sm font-semibold text-gray-700 dark:text-slate-200 border-none bg-transparent focus:ring-0 cursor-pointer hover:text-ave-blue dark:hover:text-blue-400 transition-colors p-0 pr-6"
                    >
                        {allUsers.map(user => (
                            <option key={user.id} value={user.id} className="text-black bg-white dark:bg-slate-800 dark:text-white">
                                {user.nume} ({user.rol})
                            </option>
                        ))}
                    </select>
                 </div>
                 
                 <button
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark');
                    if (isDark) {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                    } else {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                    }
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-300"
                  title="Comută tema"
                >
                  {/* Sun/Moon icon logic could be here, simplified for text */}
                  <span className="text-xs font-bold">🌓</span>
                </button>

                 <div className="flex items-center gap-2 pl-2">
                    <button 
                        onClick={() => setIsDevMode(!isDevMode)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isDevMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                        title="Mod Dezvoltator"
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDevMode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                </div>
             </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-lg z-40 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2">
                {views.map(view => (
                    <button
                        key={view}
                        onClick={() => handleSetView(view)}
                        className={`px-4 py-3 text-sm font-semibold rounded-xl text-center transition-colors ${
                            currentView === view
                            ? 'bg-ave-blue text-white shadow-md'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {view}
                    </button>
                ))}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Înscriere</p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleSetView(View.FORMULAR)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg border-2 ${
                            currentView === View.FORMULAR ? 'border-ave-blue bg-ave-blue/10 text-ave-blue' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                        }`}
                    >
                        Director
                    </button>
                    <button
                        onClick={() => handleSetView(View.JURAT_FORM)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg border-2 ${
                            currentView === View.JURAT_FORM ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                        }`}
                    >
                        Jurat
                    </button>
                </div>
            </div>

            {/* Mobile User Controls */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ave-blue text-white flex items-center justify-center font-bold">
                            {currentUser.nume.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Utilizator Activ</span>
                            <select 
                                value={currentUser.id} 
                                onChange={e => {
                                    const selectedUser = allUsers.find(u => u.id === e.target.value);
                                    if(selectedUser) {
                                        setCurrentUser(selectedUser);
                                        localStorage.setItem('currentUser', JSON.stringify(selectedUser));
                                    }
                                }}
                                className="text-xs text-gray-500 dark:text-slate-400 border-none bg-transparent p-0 focus:ring-0"
                            >
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.nume} ({user.rol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Temă Întunecată</span>
                     <button
                        onClick={() => {
                            const isDark = document.documentElement.classList.contains('dark');
                            if (isDark) {
                                document.documentElement.classList.remove('dark');
                                localStorage.setItem('theme', 'light');
                            } else {
                                document.documentElement.classList.add('dark');
                                localStorage.setItem('theme', 'dark');
                            }
                        }}
                        className="px-4 py-1.5 text-xs font-bold rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200"
                    >
                        Comută
                    </button>
                </div>

                <div className="flex items-center justify-between px-2 pb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Mod Dezvoltator</span>
                    <button 
                        onClick={() => setIsDevMode(!isDevMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDevMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDevMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
