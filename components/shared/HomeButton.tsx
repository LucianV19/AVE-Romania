import React from 'react';
import { View } from '../../types';
import { HomeIcon } from './icons';

interface HomeButtonProps {
  onNavigate: (view: View) => void;
  variant?: 'icon' | 'full';
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onNavigate, variant = 'icon', className = '' }) => {
  const handleClick = () => {
    onNavigate(View.HOME);
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-ave-blue hover:bg-ave-dark-blue text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ave-blue focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${className}`}
        title="Go to Home"
      >
        <HomeIcon className="w-5 h-5" />
        <span>Home</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ave-blue ${className}`}
      title="Go to Home"
    >
      <HomeIcon className="w-6 h-6" />
    </button>
  );
};

export default HomeButton;
