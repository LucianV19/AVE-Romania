
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LUNI, ANI } from '../constants';
import CalendarIcon from './icons/CalendarIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface DatePickerProps {
  selectedYear: string;
  selectedMonth: string;
  onChange: (year: string, month: string) => void;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedYear, selectedMonth, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'months' | 'years'>('months');
  const [displayDate, setDisplayDate] = useState(() => {
    return selectedYear && selectedMonth 
      ? new Date(parseInt(selectedYear), LUNI.indexOf(selectedMonth)) 
      : new Date();
  });
  const [yearGridStart, setYearGridStart] = useState(() => displayDate.getFullYear() - 4);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const maxYear = parseInt(ANI[0]);
  const minYear = parseInt(ANI[ANI.length - 1]);

  useEffect(() => {
    if (isOpen) {
      setView('months'); // Reset to month view on open
      if (selectedYear && selectedMonth) {
        setDisplayDate(new Date(parseInt(selectedYear), LUNI.indexOf(selectedMonth)));
      } else {
        setDisplayDate(new Date());
      }
    }
  }, [isOpen, selectedYear, selectedMonth]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handlePrev = () => {
    if (view === 'months') {
      setDisplayDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth()));
    } else {
      setYearGridStart(prev => prev - 12);
    }
  };

  const handleNext = () => {
    if (view === 'months') {
      setDisplayDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth()));
    } else {
      setYearGridStart(prev => prev + 12);
    }
  };

  const handleMonthSelect = (month: string) => {
    onChange(displayDate.getFullYear().toString(), month);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setDisplayDate(new Date(year, displayDate.getMonth()));
    setView('months');
  };

  const handleGridKeyDown = (e: React.KeyboardEvent, index: number, columns: number) => {
    e.preventDefault();
    const gridItems = calendarRef.current?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]');
    if (!gridItems) return;

    const totalItems = gridItems.length;
    let nextIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = index + 1;
        break;
      case 'ArrowLeft':
        nextIndex = index - 1;
        break;
      case 'ArrowDown':
        nextIndex = index + columns;
        break;
      case 'ArrowUp':
        nextIndex = index - columns;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = totalItems - 1;
        break;
      case 'PageUp':
        e.preventDefault();
        handlePrev();
        setTimeout(() => gridItems[index]?.focus(), 0);
        return;
      case 'PageDown':
        e.preventDefault();
        handleNext();
        setTimeout(() => gridItems[index]?.focus(), 0);
        return;
      default:
        return;
    }
    
    if (nextIndex >= 0 && nextIndex < totalItems) {
        gridItems[nextIndex]?.focus();
    }
  };

  const displayText = selectedYear && selectedMonth ? `${selectedMonth} ${selectedYear}` : 'Selectează data';
  const displayYear = displayDate.getFullYear();
  const yearRange = Array.from({ length: 12 }, (_, i) => yearGridStart + i);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Data selectată: ${displayText}. Click pentru a schimba.`}
        className={`w-full flex items-center justify-between px-4 py-3 mt-2 rounded-md focus:outline-none bg-brand-input-bg text-brand-text-dark placeholder-brand-text-dark/60 transition-all duration-300 border-2 text-base ${
          error 
            ? 'border-red-500 ring-2 ring-red-500/50' 
            : 'border-transparent focus:ring-2 focus:ring-brand-button/80'
        } ${!selectedYear || !selectedMonth ? 'text-brand-text-dark/60' : ''}`}
      >
        <span>{displayText}</span>
        <CalendarIcon />
      </button>

      {isOpen && (
        <div
          ref={calendarRef}
          role="dialog"
          aria-modal="true"
          aria-label="Selectează luna și anul"
          onKeyDown={handleKeyDown}
          className="absolute z-10 w-full sm:w-80 mt-2 bg-[#201d36] border border-gray-600 rounded-lg shadow-2xl p-4 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={(view === 'months' ? displayYear <= minYear : yearGridStart <= minYear)}
              className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-button/50"
              aria-label={view === 'months' ? 'Anul precedent' : 'Deceniul precedent'}
            >
              <ChevronLeftIcon />
            </button>
            <button 
              type="button" 
              onClick={() => setView(v => v === 'months' ? 'years' : 'months')}
              className="font-bold text-lg text-brand-white hover:bg-white/10 px-4 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-button/50"
              aria-live="polite"
            >
              {view === 'months' ? displayYear : `${yearGridStart}-${yearGridStart + 11}`}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={(view === 'months' ? displayYear >= maxYear : (yearGridStart + 11) >= maxYear)}
              className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-button/50"
              aria-label={view === 'months' ? 'Anul următor' : 'Deceniul următor'}
            >
              <ChevronRightIcon />
            </button>
          </div>

          {view === 'months' && (
            <div role="grid" aria-label={`Anul ${displayYear}`} className="grid grid-cols-3 gap-2">
              {LUNI.map((luna, index) => {
                const isSelected = displayYear.toString() === selectedYear && luna === selectedMonth;
                return (
                  <button
                    key={luna}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    onClick={() => handleMonthSelect(luna)}
                    onKeyDown={(e) => handleGridKeyDown(e, index, 3)}
                    className={`py-3 px-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#201d36] focus:ring-brand-button ${
                      isSelected
                        ? 'bg-brand-button text-brand-white font-bold'
                        : 'text-brand-text-light hover:bg-white/10'
                    }`}
                  >
                    {luna.substring(0,3)}
                  </button>
                );
              })}
            </div>
          )}

          {view === 'years' && (
            <div role="grid" aria-label={`Anii ${yearGridStart}-${yearGridStart + 11}`} className="grid grid-cols-4 gap-2">
              {yearRange.map((year, index) => {
                const isSelected = year.toString() === selectedYear;
                return (
                  <button
                    key={year}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    disabled={year < minYear || year > maxYear}
                    onClick={() => handleYearSelect(year)}
                    onKeyDown={(e) => handleGridKeyDown(e, index, 4)}
                    className={`py-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#201d36] focus:ring-brand-button disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-brand-button text-brand-white font-bold'
                        : 'text-brand-text-light hover:bg-white/10'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
