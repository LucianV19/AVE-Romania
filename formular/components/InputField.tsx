
import React from 'react';
import { FormData, FormErrors } from '../types';

interface FormConnection {
  data: FormData;
  errors: FormErrors;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

interface InputFieldProps {
  id: string;
  // FIX: Changed name from keyof FormData to string to support dot notation for nested fields.
  name: string;
  label: string;
  form: FormConnection;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  as?: 'input' | 'textarea' | 'select';
  options?: string[];
  autoComplete?: string;
}

// FIX: Added helper to get nested values from an object using a dot-notation string path.
const getNestedValue = (obj: any, path: string): any => {
    if (!path) return undefined;
    return path.split('.').reduce((p, c) => (p && p[c]), obj);
};

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  form,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  as = 'input',
  options,
  autoComplete,
}) => {
  const value = getNestedValue(form.data, name) as string || '';
  const error = getNestedValue(form.errors, name);
  const { handleChange, handleBlur, handleFocus } = form;

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
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (evt) => {
    const target = evt.target as HTMLInputElement;
    const t = target.type;
    if (t === 'number') {
      if (evt.key === '-' || evt.key === '+' || evt.key.toLowerCase() === 'e') {
        evt.preventDefault();
      }
    }
    if (t === 'tel') {
      const allowed = ['0','1','2','3','4','5','6','7','8','9','Backspace','Tab','ArrowLeft','ArrowRight','Delete'];
      if (!allowed.includes(evt.key)) {
        evt.preventDefault();
      }
    }
  };

  const commonClasses = `w-full px-4 py-3 mt-2 rounded-md focus:outline-none bg-brand-input-bg text-brand-text-dark placeholder-brand-text-dark/60 transition-all duration-300 border-2 border-transparent text-base ${
    error && typeof error === 'string'
      ? 'border-red-500 ring-2 ring-red-500/50 focus:ring-red-500/50' 
      : 'focus:ring-2 focus:ring-brand-button/80'
  }`;

  const renderInput = () => {
    const displayValue = type === 'tel' ? formatPhone(value) : value;
    const effectiveMaxLength = type === 'tel' ? 13 : maxLength;
    const commonInputProps = {
      id,
      name,
      value: displayValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
      placeholder,
      required,
      maxLength: effectiveMaxLength,
      autoComplete,
      inputMode: type === 'number' ? 'numeric' : type === 'tel' ? 'tel' : undefined,
    };
    switch (as) {
      case 'textarea':
        return (
          <textarea
            {...commonInputProps}
            className={`${commonClasses} h-32`}
            rows={5}
          />
        );
      case 'select':
        return (
            <select
              {...commonInputProps}
              className={commonClasses}
            >
              <option value="">{placeholder || 'Selectează o opțiune'}</option>
              {options?.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        );
      case 'input':
      default:
        return (
          <input
            {...commonInputProps}
            type={type}
            className={commonClasses}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="block text-brand-text-light font-medium text-sm">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          {as === 'textarea' && maxLength && (
            <p className={`text-xs font-medium ${value.length > maxLength ? 'text-red-500' : 'text-brand-text-light/70'}`}>
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      )}
      {renderInput()}
      <div className="mt-1 min-h-[1.25rem]">
          {error && typeof error === 'string' && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default InputField;
