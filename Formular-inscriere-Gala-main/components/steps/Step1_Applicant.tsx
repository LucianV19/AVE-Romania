
import React from 'react';
import { FormData, FormErrors } from '../../types';
import InputField from '../InputField';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  errors: FormErrors;
}

const Step1_Applicant: React.FC<Props> = ({ data, handleChange, handleBlur, errors }) => {
  const form = { data, errors, handleChange, handleBlur };

  return (
    <div>
      <h3 tabIndex={-1} className="text-2xl font-bold text-brand-white mb-6 text-center focus:outline-none">Contact și Experiență</h3>
      <div className="bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <InputField id="email" name="email" label="E-mail" type="email" form={form} placeholder="exemplu@email.com" required />
        <InputField id="confirmEmail" name="confirmEmail" label="Confirmare E-mail" type="email" form={form} placeholder="Repetă adresa de e-mail" required />
        <InputField id="nume" name="nume" label="Nume" form={form} placeholder="Popescu" required />
        <InputField id="prenume" name="prenume" label="Prenume" form={form} placeholder="Ion" required />
        <InputField id="telefon" name="telefon" label="Telefon" type="tel" form={form} placeholder="07xx xxx xxx" required maxLength={10} />
      </div>
      </div>
    </div>
  );
};

export default Step1_Applicant;
