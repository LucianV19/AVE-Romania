import React from 'react';

type DonutProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
};

const Donut: React.FC<DonutProps> = ({ percent, size = 72, strokeWidth = 8, color = '#3b82f6', label }) => {
  const radius = 18 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, Math.round(percent)));
  const dash = (normalized / 100) * circumference;
  const innerSize = Math.max(28, Math.round(size * 0.55));

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <g transform="rotate(-90 18 18)">
            <circle cx="18" cy="18" r={radius} fill="none" stroke="#e6e6e6" strokeWidth={strokeWidth} />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm"
            style={{ width: innerSize, height: innerSize }}
          >
            <span className="text-sm font-bold text-gray-800 dark:text-slate-100">{normalized}%</span>
            {label && <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{label}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donut;
