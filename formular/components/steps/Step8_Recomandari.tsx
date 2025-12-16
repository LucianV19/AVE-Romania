
import React, { useState, useEffect, useRef } from 'react';
import { FormData } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import { TIPURI_RECOMANDARE } from '../../constants';

interface Props {
  data: FormData;
  userName?: string;
  onAddRecomandare: () => void;
  onRemoveRecomandare: (index: number) => void;
  onRecomandareChange: (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddOrganizatie: () => void;
  onRemoveOrganizatie: (index: number) => void;
  onOrganizatieChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Step8_Recomandari: React.FC<Props> = ({ data, userName, onAddRecomandare, onRemoveRecomandare, onRecomandareChange, onAddOrganizatie, onRemoveOrganizatie, onOrganizatieChange }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const prevRecomandariCount = useRef(data.recomandari.length);

  useEffect(() => {
    if (data.recomandari.length > prevRecomandariCount.current) {
      const newId = data.recomandari[data.recomandari.length - 1].id;
      setNewlyAddedId(newId);
      const timer = setTimeout(() => setNewlyAddedId(null), 500);
      return () => clearTimeout(timer);
    }
    prevRecomandariCount.current = data.recomandari.length;
  }, [data.recomandari]);

  const inputClasses = "w-full px-4 py-3 mt-2 rounded-md focus:outline-none bg-brand-input-bg text-brand-text-dark placeholder-brand-text-dark/60 transition-all duration-300 border-2 border-transparent hover:border-brand-button/40 focus:ring-2 focus:ring-brand-button/80";

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    const a = d.slice(0, 2);
    const b = d.slice(2, 4);
    const c = d.slice(4, 7);
    const e = d.slice(7, 10);
    let r = a;
    if (b) r += b;
    if (c) r += ' ' + c;
    if (e) r += ' ' + e;
    return r;
  };

  const handleRemoveClick = (index: number, id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onRemoveRecomandare(index);
      setDeletingId(null);
    }, 300);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none">Referințe</h2>
        {userName && (
          <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
            Ultimele detalii, {userName}. Această secțiune este opțională.
          </p>
        )}
      </div>

      <div id="recomandari-section">
        <p className="text-brand-text-light mb-6 text-sm text-center">Puteți adăuga persoane sau organizații care vă pot oferi referințe.</p>
        
        <div className="space-y-6">
          {data.recomandari.map((recomandare, index) => {
            const isNewlyAdded = newlyAddedId === recomandare.id;
            return (
              <div 
                key={recomandare.id} 
                className={`group bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700 relative transition-all duration-300 hover:bg-white/10 hover:border-gray-600 ${deletingId === recomandare.id ? 'opacity-0 -translate-x-8' : ''} ${isNewlyAdded ? 'animate-add-item' : ''}`}
              >
                  <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-brand-white pt-1">Persoana {index + 1}</h4>
                      <button 
                          type="button" 
                          onClick={() => handleRemoveClick(index, recomandare.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 opacity-60 group-hover:opacity-100 focus:opacity-100"
                          aria-label={`Șterge persoana ${index + 1}`}
                      >
                          <TrashIcon />
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <div>
                          <label htmlFor={`numeRecomandare${index}`} className="block text-brand-text-light font-medium text-sm">Nume și prenume</label>
                          <input id={`numeRecomandare${index}`} name="nume" value={recomandare.nume} onChange={(e) => onRecomandareChange(index, e)} className={inputClasses} />
                      </div>
                      <div>
                          <label htmlFor={`functieRecomandare${index}`} className="block text-brand-text-light font-medium text-sm">Funcție și instituție</label>
                          <input id={`functieRecomandare${index}`} name="functie" value={recomandare.functie} onChange={(e) => onRecomandareChange(index, e)} className={inputClasses} />
                      </div>
                      <div>
                          <label htmlFor={`telefonRecomandare${index}`} className="block text-brand-text-light font-medium text-sm">Telefon</label>
                          <input id={`telefonRecomandare${index}`} name="telefon" type="tel" value={formatPhone(recomandare.telefon)} maxLength={13} onChange={(e) => onRecomandareChange(index, e)} placeholder="07xx xxx xxx" className={inputClasses} />
                      </div>
                       <div>
                          <label htmlFor={`tipRecomandare${index}`} className="block text-brand-text-light font-medium text-sm">Tip Recomandare</label>
                          <select id={`tipRecomandare${index}`} name="tip" value={recomandare.tip} onChange={(e) => onRecomandareChange(index, e)} className={inputClasses}>
                              <option value="">Selectează tipul</option>
                              {TIPURI_RECOMANDARE.map(tip => <option key={tip} value={tip}>{tip}</option>)}
                          </select>
                      </div>
                  </div>
              </div>
            )
          })}
        </div>

        <button 
            type="button"
            onClick={onAddRecomandare}
            className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-sm bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Adaugă persoană</span>
        </button>

        <div className="mt-8 space-y-6">
          {(data.organizatiiReferinta || []).map((org, index) => (
            <div key={org.id} className={`group bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700 relative transition-all duration-300 hover:bg-white/10 hover:border-gray-600`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-brand-white pt-1">Organizație {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => onRemoveOrganizatie(index)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 opacity-60 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Șterge organizația ${index + 1}`}
                >
                  <TrashIcon />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                 <div>
                   <label className="block text-brand-text-light font-medium text-sm">Numele organizației</label>
                   <input name="nume" value={org.nume} onChange={(e) => onOrganizatieChange(index, e)} className={inputClasses} />
                 </div>
                 <div>
                   <label className="block text-brand-text-light font-medium text-sm">Telefon</label>
                   <input name="telefon" type="tel" value={formatPhone(org.telefon)} maxLength={13} onChange={(e) => onOrganizatieChange(index, e)} placeholder="07xx xxx xxx" className={inputClasses} />
                 </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddOrganizatie}
          className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-sm bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Adaugă organizație</span>
        </button>
      </div>
    </div>
  );
};

export default Step8_Recomandari;
