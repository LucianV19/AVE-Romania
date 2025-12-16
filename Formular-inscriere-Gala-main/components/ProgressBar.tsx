
import React from 'react';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  goToStep: (step: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, goToStep }) => {
  return (
    <div className="w-full px-4 sm:px-0">
      {/* Desktop View */}
      <div className="hidden sm:grid items-start gap-x-8" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <div key={step} className="flex flex-col items-center cursor-pointer group" onClick={() => goToStep(stepNumber)}>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 border-2 ${
                  isActive ? 'bg-brand-button text-brand-white border-brand-button ring-4 ring-brand-button/30' : 
                  isCompleted ? 'bg-brand-button/50 text-brand-white border-brand-button/50' : 
                  'bg-transparent text-brand-text-light border-brand-text-light/50 group-hover:border-brand-white'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="leading-none relative top-[1px]">{stepNumber}</span>
                )}
              </div>
              <p className={`mt-2 text-center text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-brand-white' : 'text-brand-text-light group-hover:text-brand-white'}`}>{step}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex flex-col items-center text-center">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            return (
              <React.Fragment key={step}>
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => goToStep(stepNumber)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                      isActive
                        ? 'bg-brand-button text-brand-white border-brand-button scale-110'
                        : isCompleted
                        ? 'bg-brand-button/50 text-brand-white border-brand-button/50'
                        : 'bg-transparent text-brand-text-light border-brand-text-light/50'
                    }`}
                  >
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm leading-none relative top-[0.5px]">{stepNumber}</span>
                    )}
                  </div>
                </div>
                {stepNumber < steps.length && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors duration-500 ${isCompleted ? 'bg-brand-button/50' : 'bg-brand-text-light/30'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="mt-4 text-sm font-semibold text-brand-white">
          Pasul {currentStep}: {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
