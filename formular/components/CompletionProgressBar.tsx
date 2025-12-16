
import React from 'react';

interface CompletionProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const CompletionProgressBar: React.FC<CompletionProgressBarProps> = ({ currentStep, totalSteps }) => {
  // Progress is based on completed steps. Reaching the final step (review) means 100% progress.
  const progress = Math.max(0, Math.min(((currentStep - 1) / (totalSteps - 1)) * 100, 100));

  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 my-8" role="progressbar" aria-label="Progres formular" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="bg-brand-button h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default CompletionProgressBar;
