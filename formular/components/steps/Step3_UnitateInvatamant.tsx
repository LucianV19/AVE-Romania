
import React, { useState } from 'react';
import { FormData, FormErrors } from '../../types';
import InputField from '../InputField';
import { JUDETE, NIVELURI_INVATAMANT } from '../../constants';
import { getRegions } from '../../../utils/regions';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleNiveluriChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
  userName?: string;
}

const Step3_UnitateInvatamant: React.FC<Props> = ({ data, handleChange, handleNiveluriChange, errors, userName }) => {
  const [isRegionFocused, setIsRegionFocused] = useState(false);

  const handleRegionSelect = (region: string) => {
    const syntheticEvent = {
      currentTarget: { name: 'regiuneUnitate', value: region, type: 'text' },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
    setIsRegionFocused(false);
  };
  
  const allRegions = getRegions();
  const filteredRegions =
    isRegionFocused && data.regiuneUnitate
      ? allRegions.filter(
          r =>
            r.toLowerCase().includes(data.regiuneUnitate.toLowerCase()) &&
            r.toLowerCase() !== data.regiuneUnitate.toLowerCase()
        )
      : [];
  
  const form = { data, errors, handleChange };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none">Pasul 3: Unitatea de Învățământ</h2>
        {userName && (
          <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
            Continuăm cu datele despre unitatea de învățământ, {userName}.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="denumireUnitate" name="denumireUnitate" label="Denumirea unității de învățământ" form={form} placeholder="Ex: Liceul Teoretic 'Avram Iancu'" required />
        <InputField id="websiteUnitate" name="websiteUnitate" label="Website-ul unității (opțional)" type="url" form={form} placeholder="https://..." />
        <InputField as="select" id="judetUnitate" name="judetUnitate" label="Județul unității de învățământ" form={form} options={JUDETE} placeholder="Selectează județul" required />
        <InputField id="localitateUnitate" name="localitateUnitate" label="Localitatea unității de învățământ" form={form} placeholder="Ex: Cluj-Napoca" required />
        <InputField id="adresaUnitate" name="adresaUnitate" label="Adresa unității de învățământ" form={form} placeholder="Str. Exemplului, Nr. 1" required />
        
        <div className="relative">
          <InputField 
            as="input" 
            id="regiuneUnitate" 
            name="regiuneUnitate" 
            label="Regiunea unității de învățământ" 
            form={{ 
                ...form, 
                handleFocus: () => setIsRegionFocused(true),
                handleBlur: () => setTimeout(() => setIsRegionFocused(false), 200)
            }}
            placeholder="Tastați pentru a căuta regiunea"
            autoComplete="off"
          />
          {filteredRegions.length > 0 && (
            <div className="absolute z-10 w-full bg-[#201d36] border border-gray-600 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              <ul className="py-1">
                {filteredRegions.map(region => (
                  <li 
                    key={region}
                    onClick={() => handleRegionSelect(region)}
                    className="px-4 py-2 text-brand-text-light hover:bg-brand-button cursor-pointer transition-colors"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRegionSelect(region); }}
                  >
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <fieldset id="niveluri-invatamant-section" className="mb-6">
        <legend className="block text-brand-text-light font-medium text-sm mb-4">
          Unitatea de învățământ preuniversitar de stat pe pe care o coordonezi asigură: <span className="text-red-400">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NIVELURI_INVATAMANT.map(nivel => (
            <label key={nivel.id} className="flex items-start p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name={nivel.id}
                checked={data.niveluriInvatamant[nivel.id]}
                onChange={handleNiveluriChange}
                className="sr-only peer"
              />
              <span className="w-5 h-5 mt-0.5 rounded border-2 border-brand-text-light flex-shrink-0 flex items-center justify-center transition-colors peer-checked:border-green-500 peer-checked:bg-green-500">
                 <svg className="w-4 h-4 text-brand-white transition-transform scale-0 peer-checked:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
              </span>
              <span className="ml-3 text-sm font-medium text-brand-text-light">{nivel.label}</span>
            </label>
          ))}
        </div>
        {errors.niveluriInvatamant && <p className="text-red-400 text-sm mt-1">{errors.niveluriInvatamant}</p>}
      </fieldset>

      <fieldset id="personalitate-juridica-section" className="mb-6">
        <legend className="block text-brand-text-light font-medium text-sm mb-4">
          Școala ta are personalitate juridică? <span className="text-red-400">*</span>
        </legend>
        <div className="flex gap-6">
          {['da', 'nu'].map(option => (
            <label key={option} className="flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-white/10">
              <input
                type="radio"
                name="arePersonalitateJuridica"
                value={option}
                checked={data.arePersonalitateJuridica === option}
                onChange={handleChange}
                className="sr-only peer"
              />
              <span className="w-5 h-5 rounded-full border-2 border-brand-text-light flex items-center justify-center transition-all duration-200 transform peer-checked:border-green-500 bg-transparent peer-checked:bg-green-500/10 peer-checked:scale-105">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full transition-transform transform scale-0 peer-checked:scale-100"></span>
              </span>
              <span className="ml-3 text-sm font-medium text-brand-text-light capitalize">{option}</span>
            </label>
          ))}
        </div>
        {errors.arePersonalitateJuridica && <p className="text-red-400 text-sm mt-1">{errors.arePersonalitateJuridica}</p>}
      </fieldset>
      {data.arePersonalitateJuridica === 'nu' && (
        <div className="animate-fade-in">
          <InputField id="unitateParinte" name="unitateParinte" label="Unitatea de care aparține" form={form} placeholder="Ex: Școala Gimnazială Nr. ..." required />
        </div>
      )}
    </div>
  );
};

export default Step3_UnitateInvatamant;
