import React from 'react';

interface Props {
  isAdmin: boolean;
  onToggle: () => void;
}

const AdminBypassButton: React.FC<Props> = ({ isAdmin, onToggle }) => {
  const baseClasses = "py-1 px-3 text-xs font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg transition-colors duration-300";
  const activeClasses = "bg-green-500 text-white focus:ring-green-400";
  const inactiveClasses = "bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-gray-400";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${baseClasses} ${isAdmin ? activeClasses : inactiveClasses}`}
      aria-label={`Toggle admin mode, currently ${isAdmin ? 'on' : 'off'}`}
    >
      Admin: {isAdmin ? 'ON' : 'OFF'}
    </button>
  );
};

export default AdminBypassButton;
