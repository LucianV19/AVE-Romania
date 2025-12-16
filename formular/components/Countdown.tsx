import React, { useEffect, useState } from 'react';
import { DEADLINE } from '../constants';

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  const compute = () => {
    const now = new Date();
    const target = new Date(DEADLINE.year, DEADLINE.monthIndex, DEADLINE.day, DEADLINE.hour, DEADLINE.minute, 0);
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setTimeLeft({ days, hours });
  };

  useEffect(() => {
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-6">
      <span className="text-brand-text-light">Au mai rămas:</span>
      <div className="flex items-end gap-6">
        <div className="px-4 py-3 rounded-lg border border-brand-text-light/40 bg-white/5 flex flex-col items-center min-w-[90px]">
          <div className="text-5xl font-bold text-brand-white leading-none">{timeLeft.days}</div>
          <div className="text-[11px] px-2 py-1 mt-2 rounded-md border border-brand-text-light/30 text-brand-text-light">de zile</div>
        </div>
        <div className="px-4 py-3 rounded-lg border border-brand-text-light/40 bg-white/5 flex flex-col items-center min-w-[90px]">
          <div className="text-5xl font-bold text-brand-white leading-none">{timeLeft.hours}</div>
          <div className="text-[11px] px-2 py-1 mt-2 rounded-md border border-brand-text-light/30 text-brand-text-light">de ore</div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
