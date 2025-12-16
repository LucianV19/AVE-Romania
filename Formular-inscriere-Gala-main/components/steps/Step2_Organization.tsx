
import React from 'react';
import { FormData, FormErrors } from '../../types';
import InputField from '../InputField';
import DatePicker from '../DatePicker';
import { MOD_OCUPARE_OPTIONS } from '../../constants';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleDateChange: (name: { year: keyof FormData; month: keyof FormData }, year: string, month: string) => void;
  errors: FormErrors;
  userName?: string;
}

const Step2_Organization: React.FC<Props> = ({ data, handleChange, handleDateChange, errors, userName }) => {
  const form = { data, errors, handleChange };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 tabIndex={-1} className="text-2xl font-bold text-brand-white focus:outline-none">Experiență Profesională</h3>
        {userName && (
          <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
            Excelent, {userName}! Acum să vorbim despre experiența ta.
          </p>
        )}
      </div>
      <div className="bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700/50">
      <div id="functie-inceput-section" className="mb-6">
        <label className="block text-brand-text-light font-medium text-sm mb-2">
          Data de la care ocupi funcția de director/director adjunct în unitatea de învățământ care face obiectul prezentei înscrieri? <span className="text-red-400">*</span>
        </label>
        <DatePicker
            selectedYear={data.functieInceputAn}
            selectedMonth={data.functieInceputLuna}
            onChange={(year, month) => handleDateChange({ year: 'functieInceputAn', month: 'functieInceputLuna' }, year, month)}
            error={errors.functieInceputAn}
        />
        {errors.functieInceputAn && <p className="text-red-400 text-sm mt-1">{errors.functieInceputAn}</p>}
      </div>

      <InputField id="aniActivitateSistem" name="aniActivitateSistem" type="number" label="Câți ani de activitate ai în sistemul de educație din România (indiferent de rol)?" form={form} placeholder="Ex: 15" required />
      
      <InputField as="select" id="modOcupareFunctie" name="modOcupareFunctie" label="Ocupi funcția de director/director adjunct printr-o decizie de:" form={form} options={MOD_OCUPARE_OPTIONS} placeholder="Alege o variantă" required />
      {data.modOcupareFunctie === 'Altă situație' && (
        <InputField id="modOcupareDetalii" name="modOcupareDetalii" label="Detaliați situația" form={form} placeholder="Descrieți pe scurt" required />
      )}

      <InputField id="aniConducereAcumulati" name="aniConducereAcumulati" type="number" label="Câți ani de activitate de conducere (director sau director adjunct) ai acumulat până în prezent?" form={form} placeholder="Ex: 10" required />
      </div>
    </div>
  );
};

export default Step2_Organization;
