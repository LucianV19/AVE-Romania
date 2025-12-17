
import React from 'react';
import { FormData, FormErrors } from '../../types';
import InputField from '../InputField';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
  userName?: string;
}

const studentFields: { name: keyof FormData['statistici'], label: string }[] = [
    { name: 'eleviInscrisi', label: 'Număr total de elevi înscriși' },
    { name: 'eleviRomi', label: 'Număr de elevi de etnie romă' },
    { name: 'eleviCES', label: 'Număr de elevi cu CES' },
    { name: 'eleviDezavantajati', label: 'Număr de elevi din grupuri dezavantajate' },
    { name: 'eleviBursaSociala', label: 'Număr de elevi beneficiari de bursă socială' },
    { name: 'eleviNavetisti', label: 'Număr de elevi navetiști' },
    { name: 'eleviAbandonScolar', label: 'Număr de elevi în risc de abandon școlar' },
];

const staffFields: { name: keyof FormData['statistici'], label: string }[] = [
    { name: 'personalDidacticTitular', label: 'Număr de personal didactic titular' },
    { name: 'personalDidacticSuplinitor', label: 'Număr de personal didactic suplinitor/detașat' },
    { name: 'personalNedidactic', label: 'Număr de personal nedidactic și administrativ' },
];

const Step4_Statistici: React.FC<Props> = ({ data, handleChange, errors, userName }) => {
  const form = { data, errors, handleChange };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none">Pasul 4: Statistici Cheie</h2>
        {userName && (
          <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
            Acum câteva date statistice, {userName}. Toate câmpurile sunt obligatorii.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Grup Date Elevi */}
        <div className="bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-brand-text-light border-b border-gray-700 pb-2 mb-6">Date Elevi</h3>
          {studentFields.map(field => (
            <InputField
              key={field.name}
              id={field.name}
              name={`statistici.${field.name}`}
              label={field.label}
              type="number"
              form={form}
              placeholder="0"
              required
              min={0}
            />
          ))}
        </div>

        {/* Grup Date Personal */}
        <div className="bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-brand-text-light border-b border-gray-700 pb-2 mb-6">Date Personal</h3>
          {staffFields.map(field => (
            <InputField
              key={field.name}
              id={field.name}
              name={`statistici.${field.name}`}
              label={field.label}
              type="number"
              form={form}
              placeholder="0"
              required
              min={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step4_Statistici;