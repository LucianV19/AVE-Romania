
import React from 'react';
import { ThemeColors } from '../types';
import CloseIcon from './icons/CloseIcon';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
  setTheme: React.Dispatch<React.SetStateAction<ThemeColors>>;
  resetTheme: () => void;
}

const ThemeOption: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}> = ({ label, value, onChange, children }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-md border border-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {children}
        </div>
        <label className="text-sm font-medium text-brand-text-light">{label}</label>
      </div>
      <div className="relative w-8 h-8 rounded-full border-2 border-gray-500 overflow-hidden">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }}></div>
      </div>
    </div>
  );
};


const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose, theme, setTheme, resetTheme }) => {
  if (!isOpen) return null;

  const handleColorChange = (key: keyof ThemeColors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      [key]: e.target.value,
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-[#201d36] border border-gray-600 rounded-lg shadow-2xl p-6 w-full max-w-sm text-brand-white z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Theme Settings</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close settings">
                <CloseIcon />
            </button>
        </div>
        
        <div className="space-y-1">
            <ThemeOption label="Background Start" value={theme.bgStart} onChange={handleColorChange('bgStart')}>
                <div className="w-full h-full" style={{ backgroundColor: theme.bgStart }}></div>
            </ThemeOption>
            <ThemeOption label="Background End" value={theme.bgEnd} onChange={handleColorChange('bgEnd')}>
                <div className="w-full h-full" style={{ background: `linear-gradient(45deg, ${theme.bgStart}, ${theme.bgEnd})` }}></div>
            </ThemeOption>
            <ThemeOption label="Button Color" value={theme.button} onChange={handleColorChange('button')}>
                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.button, color: theme.white }}>OK</div>
            </ThemeOption>
            <ThemeOption label="Input Background" value={theme.inputBg} onChange={handleColorChange('inputBg')}>
                <div className="w-full h-full p-2" style={{ backgroundColor: theme.bgStart }}>
                    <div className="w-full h-full rounded-sm" style={{ backgroundColor: theme.inputBg }}></div>
                </div>
            </ThemeOption>
            <ThemeOption label="Light Text" value={theme.textLight} onChange={handleColorChange('textLight')}>
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.bgStart }}>
                    <span className="font-bold" style={{ color: theme.textLight }}>Aa</span>
                </div>
            </ThemeOption>
            <ThemeOption label="Dark Text" value={theme.textDark} onChange={handleColorChange('textDark')}>
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.inputBg }}>
                    <span className="font-bold" style={{ color: theme.textDark }}>Aa</span>
                </div>
            </ThemeOption>
            <ThemeOption label="Primary Text (White)" value={theme.white} onChange={handleColorChange('white')}>
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.button }}>
                    <span className="font-bold" style={{ color: theme.white }}>Aa</span>
                </div>
            </ThemeOption>
        </div>

        <div className="mt-8">
            <button
                onClick={resetTheme}
                className="w-full py-2 px-4 bg-transparent border-2 border-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-brand-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300"
            >
                Reset to Default
            </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
