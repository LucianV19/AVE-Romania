import React, { useState, useEffect } from 'react';
import { JuryFormData, JuryFormErrors, ThemeColors } from './types';
import { STEPS, DOMENII_EXPERTIZA } from './constants';
import { submitJuryRegistration } from './supabase';

const initialFormData: JuryFormData = {
  nume: '',
  prenume: '',
  email: '',
  confirmEmail: '',
  telefon: '',
  profesie: '',
  organizatie: '',
  experienta: '',
  domeniu_expertiza: '',
  ani_experienta: '',
  linkedin_url: '',
  motivatie: '',
  foto_url: '',
  acordGDPR: false
};

const defaultTheme: ThemeColors = {
  bgStart: '#100E1D',
  bgEnd: '#16213e',
  inputBg: '#D7D2E8',
  textDark: '#2E234F',
  textLight: '#DCD8EC',
  button: '#575A89',
  white: '#FFFFFF'
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JuryFormData>(initialFormData);
  const [errors, setErrors] = useState<JuryFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [theme] = useState<ThemeColors>(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value as string);
    });
  }, [theme]);

  useEffect(() => {
    const savedData = localStorage.getItem('juryFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  const saveProgress = () => {
    localStorage.setItem('juryFormData', JSON.stringify(formData));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.currentTarget;
    let value: string | boolean = type === 'checkbox' ? (e.currentTarget as HTMLInputElement).checked : e.currentTarget.value;

    if (type === 'tel') {
      value = value.toString().replace(/[^0-9]/g, '').slice(0, 10);
    }
    if (type === 'number') {
      value = value.toString().replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: JuryFormErrors = {};

    switch (step) {
      case 1:
        if (!formData.nume) newErrors.nume = 'Numele este obligatoriu';
        if (!formData.prenume) newErrors.prenume = 'Prenumele este obligatoriu';
        if (!formData.email) newErrors.email = 'Emailul este obligatoriu';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Adresa de email este invalidă';
        if (!formData.confirmEmail) newErrors.confirmEmail = 'Confirmarea emailului este obligatorie';
        else if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Emailurile nu se potrivesc';
        if (!formData.telefon) newErrors.telefon = 'Telefonul este obligatoriu';
        else if (formData.telefon.length !== 10) newErrors.telefon = 'Telefonul trebuie să aibă 10 cifre';
        break;
      case 2:
        if (!formData.profesie) newErrors.profesie = 'Profesia este obligatorie';
        if (!formData.organizatie) newErrors.organizatie = 'Organizația este obligatorie';
        if (!formData.experienta) newErrors.experienta = 'Experiența este obligatorie';
        if (!formData.domeniu_expertiza) newErrors.domeniu_expertiza = 'Domeniul de expertiză este obligatoriu';
        if (!formData.ani_experienta) newErrors.ani_experienta = 'Anii de experiență sunt obligatorii';
        break;
      case 3:
        if (!formData.motivatie) newErrors.motivatie = 'Motivația este obligatorie';
        if (formData.motivatie && formData.motivatie.length < 100) {
          newErrors.motivatie = 'Motivația trebuie să aibă cel puțin 100 de caractere';
        }
        break;
      case 4:
        if (!formData.acordGDPR) newErrors.acordGDPR = 'Acordul GDPR este obligatoriu';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveProgress();
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    saveProgress();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitJuryRegistration({
        nume: formData.nume,
        prenume: formData.prenume,
        email: formData.email,
        telefon: formData.telefon,
        profesie: formData.profesie,
        organizatie: formData.organizatie,
        experienta: formData.experienta,
        domeniu_expertiza: formData.domeniu_expertiza,
        ani_experienta: parseInt(formData.ani_experienta) || 0,
        linkedin_url: formData.linkedin_url || undefined,
        motivatie: formData.motivatie,
        foto_url: formData.foto_url || undefined
      });

      localStorage.removeItem('juryFormData');
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'A apărut o eroare. Vă rugăm încercați din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-brand-white mb-4">Mulțumim, {formData.prenume}!</h1>
          <p className="text-xl text-brand-text-light mb-8">
            Înscriere ta ca jurat a fost trimisă cu succes. Vei primi un email de confirmare în curând.
          </p>
          <p className="text-brand-text-light mb-8">
            Echipa noastră va analiza candidatura ta și te vom contacta în cel mai scurt timp posibil.
          </p>
          <a
            href="/"
            className="inline-block py-3 px-8 bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 transition-all"
          >
            Înapoi la Platformă
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6">
      <div className="w-full max-w-3xl py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-block border border-brand-text-light p-2 mb-6">
            <p className="text-sm font-bold tracking-wider">GALA PREMIILOR</p>
            <p className="text-xs">PENTRU DIRECTORII ANULUI 2026</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-white mb-4">
            Formular Înscriere Jurat
          </h1>
          <p className="text-brand-text-light mb-4">
            Bine ai venit în comunitatea celor care vor genera schimbarea în educație!
          </p>
        </header>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    currentStep >= step.id
                      ? 'bg-brand-button text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-brand-button' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
                <p className="text-xs mt-2 text-brand-text-light">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white mb-6">Date Personale</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-brand-text-light mb-2">Nume *</label>
                  <input
                    type="text"
                    name="nume"
                    value={formData.nume}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                  />
                  {errors.nume && <p className="text-red-400 text-sm mt-1">{errors.nume}</p>}
                </div>

                <div>
                  <label className="block text-brand-text-light mb-2">Prenume *</label>
                  <input
                    type="text"
                    name="prenume"
                    value={formData.prenume}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                  />
                  {errors.prenume && <p className="text-red-400 text-sm mt-1">{errors.prenume}</p>}
                </div>
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Confirmă Email *</label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.confirmEmail && <p className="text-red-400 text-sm mt-1">{errors.confirmEmail}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Telefon *</label>
                <input
                  type="tel"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  placeholder="0712345678"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.telefon && <p className="text-red-400 text-sm mt-1">{errors.telefon}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white mb-6">Experiență Profesională</h2>

              <div>
                <label className="block text-brand-text-light mb-2">Profesia/Funcția Actuală *</label>
                <input
                  type="text"
                  name="profesie"
                  value={formData.profesie}
                  onChange={handleChange}
                  placeholder="Ex: Director Executiv, Profesor Universitar"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.profesie && <p className="text-red-400 text-sm mt-1">{errors.profesie}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Organizația *</label>
                <input
                  type="text"
                  name="organizatie"
                  value={formData.organizatie}
                  onChange={handleChange}
                  placeholder="Ex: Universitatea București"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.organizatie && <p className="text-red-400 text-sm mt-1">{errors.organizatie}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Descriere Experiență Profesională *</label>
                <textarea
                  name="experienta"
                  value={formData.experienta}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Descrie pe scurt experiența ta profesională relevantă..."
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.experienta && <p className="text-red-400 text-sm mt-1">{errors.experienta}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Domeniu de Expertiză *</label>
                <select
                  name="domeniu_expertiza"
                  value={formData.domeniu_expertiza}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                >
                  <option value="">Selectează domeniul</option>
                  {DOMENII_EXPERTIZA.map(domeniu => (
                    <option key={domeniu.id} value={domeniu.label}>{domeniu.label}</option>
                  ))}
                </select>
                {errors.domeniu_expertiza && <p className="text-red-400 text-sm mt-1">{errors.domeniu_expertiza}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Ani de Experiență *</label>
                <input
                  type="number"
                  name="ani_experienta"
                  value={formData.ani_experienta}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.ani_experienta && <p className="text-red-400 text-sm mt-1">{errors.ani_experienta}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Link LinkedIn (opțional)</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white mb-6">Motivație</h2>

              <div>
                <label className="block text-brand-text-light mb-2">
                  De ce vrei să fii jurat la Gala Premiilor pentru Directorii Anului? *
                </label>
                <p className="text-sm text-brand-text-light mb-2">
                  Te rugăm să descrii motivația ta în cel puțin 100 de caractere.
                </p>
                <textarea
                  name="motivatie"
                  value={formData.motivatie}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Descrie motivația ta pentru a deveni jurat..."
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                <p className="text-sm text-brand-text-light mt-1">
                  {formData.motivatie.length} / 100 caractere minime
                </p>
                {errors.motivatie && <p className="text-red-400 text-sm mt-1">{errors.motivatie}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Link către Fotografie Profesională (opțional)</label>
                <p className="text-sm text-brand-text-light mb-2">
                  Te rugăm să ne furnizezi un link către o fotografie profesională pentru promovarea ta ca jurat.
                </p>
                <input
                  type="url"
                  name="foto_url"
                  value={formData.foto_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white mb-6">Revizuire și Trimitere</h2>

              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-brand-white mb-2">Date Personale</h3>
                  <p className="text-brand-text-light">
                    <strong>Nume:</strong> {formData.nume} {formData.prenume}
                  </p>
                  <p className="text-brand-text-light">
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p className="text-brand-text-light">
                    <strong>Telefon:</strong> {formData.telefon}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-brand-white mb-2">Experiență Profesională</h3>
                  <p className="text-brand-text-light">
                    <strong>Profesie:</strong> {formData.profesie}
                  </p>
                  <p className="text-brand-text-light">
                    <strong>Organizație:</strong> {formData.organizatie}
                  </p>
                  <p className="text-brand-text-light">
                    <strong>Domeniu Expertiză:</strong> {formData.domeniu_expertiza}
                  </p>
                  <p className="text-brand-text-light">
                    <strong>Ani Experiență:</strong> {formData.ani_experienta}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-brand-white mb-2">Motivație</h3>
                  <p className="text-brand-text-light whitespace-pre-wrap">{formData.motivatie}</p>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acordGDPR"
                  checked={formData.acordGDPR}
                  onChange={handleChange}
                  className="mt-1 mr-3"
                />
                <label className="text-brand-text-light text-sm">
                  Sunt de acord cu prelucrarea datelor personale conform GDPR și accept termenii și condițiile de participare ca jurat. *
                </label>
              </div>
              {errors.acordGDPR && <p className="text-red-400 text-sm">{errors.acordGDPR}</p>}

              {submitError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200">{submitError}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                saveProgress();
                alert('Progresul a fost salvat!');
              }}
              className="py-3 px-6 bg-transparent border-2 border-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-brand-button transition-all"
            >
              Salvează
            </button>

            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-3 px-6 bg-transparent border-2 border-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-brand-button transition-all"
                >
                  Înapoi
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-3 px-6 bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 transition-all"
                >
                  Următorul
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Se trimite...' : 'Trimite Formularul'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
