import React, { useState } from 'react';
import { View, User } from '../types';
import { MenuIcon, XMarkIcon, HomeIcon } from './shared/icons';
import { useNotifications } from './contexts/NotificationContext';

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
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
             {/* Notification Bell */}
             <div className="relative">
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-full text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 relative focus:outline-none"
                    title="Notificări"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {isNotificationsOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200">Notificări</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-ave-blue hover:underline font-medium">Marchează citite</button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center text-gray-500 dark:text-slate-400">
                                        <span className="text-2xl mb-2">🔕</span>
                                        <p className="text-sm">Nu ai notificări recente.</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 10).map(n => (
                                        <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm ${!n.read ? 'font-bold text-ave-dark-blue dark:text-slate-100' : 'font-semibold text-gray-700 dark:text-slate-300'}`}>{n.title}</p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 text-center">
                                <button onClick={() => setIsNotificationsOpen(false)} className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-slate-200">Închide</button>
                            </div>
                        </div>
                    </>
                )}
             </div>

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
