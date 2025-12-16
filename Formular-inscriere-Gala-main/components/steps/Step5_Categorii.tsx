import React from 'react';
import { FormErrors } from '../../types';
import { CATEGORII_PROIECT } from '../../constants';

interface Props {
  data: { [key: string]: boolean };
  handleCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
  userName?: string;
}

const Step5_Categorii: React.FC<Props> = ({ data, handleCategoryChange, errors, userName }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none">Pasul 5: Alegere Categorii</h2>
        {userName && (
          <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
            Alege domeniile în care proiectele tale au avut cel mai mare impact, {userName}.
          </p>
        )}
      </div>

      <fieldset id="categorii-section" className="mb-6">
        <legend className="block text-brand-text-light font-medium text-sm mb-4 text-center">
          Selectează categoria/categoriile la care dorești să aplici (maximum două). <span className="text-red-400">*</span>
        </legend>
        <div className="space-y-4 max-w-lg mx-auto">
          {CATEGORII_PROIECT.map(cat => (
            <label key={cat.id} className="block p-4 rounded-lg border-2 border-gray-700 transition-all duration-200 cursor-pointer hover:border-brand-button hover:bg-white/10 focus-within:ring-2 focus-within:ring-brand-button/50 focus-within:border-brand-button has-[:checked]:border-green-400 has-[:checked]:bg-green-400/15">
              <div className="flex items-start">
                  <input
                    type="checkbox"
                    name={cat.id}
                    checked={data[cat.id]}
                    onChange={handleCategoryChange}
                    className="sr-only peer"
                  />
                   <div className="w-5 h-5 mt-1 rounded border-2 border-brand-text-light flex-shrink-0 flex items-center justify-center transition-colors duration-200 peer-checked:border-green-500 peer-checked:bg-green-500">
                      <svg className="w-4 h-4 text-brand-white transition-transform transform scale-0 peer-checked:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
                  <div className="flex-grow ml-4">
                      <p className="font-bold text-brand-white">{cat.label}</p>
                      <p className="text-sm text-brand-text-light mt-1">{cat.description}</p>
                  </div>
              </div>
            </label>
          ))}
        </div>
        {errors.categorii && <p className="text-red-400 text-sm mt-2 text-center">{errors.categorii}</p>}
      </fieldset>
    </div>
  );
};

export default Step5_Categorii;