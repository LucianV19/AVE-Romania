import React, { useState, useEffect } from 'react';
import { JuryFormData, JuryFormErrors, ThemeColors } from './types';

const initialFormData: JuryFormData = {
  nume: '',
  prenume: '',
  email: '',
  confirmEmail: '',
  password: '',
  telefon: '',
  profesie: '',
  organizatie: '',
  experienta: '',
  domeniu_expertiza: '',
  ani_experienta: '',
  linkedin_url: '',
  facebook_url: '',
  instagram_url: '',
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
    // Remove numeric replacement for general inputs if any

    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        localStorage.setItem('juryFormData', JSON.stringify(newData)); // Save on change
        return newData;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: JuryFormErrors = {};

    if (!formData.nume) newErrors.nume = 'Numele este obligatoriu';
    if (!formData.prenume) newErrors.prenume = 'Prenumele este obligatoriu';
    if (!formData.email) newErrors.email = 'Emailul este obligatoriu';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Adresa de email este invalidă';
    
    if (!formData.password) newErrors.password = 'Parola este obligatorie';
    else if (formData.password.length < 6) newErrors.password = 'Parola trebuie să aibă minim 6 caractere';

    if (!formData.motivatie) newErrors.motivatie = 'Motivația este obligatorie';
    if (formData.motivatie && formData.motivatie.length > 400) {
         newErrors.motivatie = 'Textul depășește limita de 400 de caractere.';
    }

    if (!formData.acordGDPR) newErrors.acordGDPR = 'Acordul GDPR este obligatoriu';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        const firstError = document.querySelector('.text-red-400');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const registration = {
        id: `jury_${Date.now()}`,
        nume: formData.nume,
        prenume: formData.prenume,
        email: formData.email,
        password: formData.password,
        telefon: formData.telefon,
        profesie: formData.profesie,
        organizatie: formData.organizatie,
        experienta: formData.experienta,
        domeniu_expertiza: formData.domeniu_expertiza,
        ani_experienta: parseInt(formData.ani_experienta) || 0,
        linkedin_url: formData.linkedin_url || '',
        facebook_url: formData.facebook_url || '',
        instagram_url: formData.instagram_url || '',
        motivatie: formData.motivatie,
        foto_url: formData.foto_url || '',
        status: 'in_asteptare',
        nota_admin: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const existingRegistrations = JSON.parse(localStorage.getItem('juryRegistrations') || '[]');
      existingRegistrations.push(registration);
      localStorage.setItem('juryRegistrations', JSON.stringify(existingRegistrations));

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
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 p-6 rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-brand-white mb-4">Mulțumim!</h2>
            <p className="text-brand-text-light mb-6">
              Pentru că ne dorim să avem același orizont de așteptare, te rog să ai în vedere că actualizările pe website și postările din social media, se publică de îndată ce întrunim condițiile de mai sus, pentru 6 jurați, ca să putem lucra vizualul de grup.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-brand-button text-brand-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-colors"
              >
                Înapoi la Site
              </button>
            </div>
          </div>
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
            Dragă jurat,
          </h1>
          <div className="text-brand-text-light mb-4 text-left space-y-4">
            <p>
              Bine ai venit în comunitatea celor care vor genera schimbarea în educație, prin alegerea <strong>Directorilor Anului 2025</strong>, directori de școală a căror realizări inspiră și dau încredere într-un viitor mai bun.
            </p>
            <p>
              Implicarea ta ca jurat o vom face cunoscută pe rețelele de socializare AVE <a href="#" className="text-blue-400 underline">LinkedIn</a>, <a href="#" className="text-blue-400 underline">Facebook</a> și în secțiunea de jurat a <a href="#" className="text-blue-400 underline">Galei Premiilor pentru Directorii Anului</a>.
            </p>
            <p>
              Poți spune și tu comunității tale online despre rolul important pe care ți l-ai asumat, cu ajutorul <strong>vizualului</strong> pe care îl vom crea special pentru tine.
              Mai jos poți vedea simulări ale execuțiilor care vor apărea în mediul online: vizual de grup, individual, secțiunea dedicată juriului Galei. M-am folosit pe mine ca exemplu. 😊
            </p>
            <p>
              Pentru a putea implementa toate cele de mai sus sunt necesare câteva informații de la tine. Te rog să completezi câmpurile de mai jos, <strong>folosind diacritice</strong>.
            </p>
            <p className="font-bold text-blue-300">
              Asigură-te că datele sunt corecte întrucât ele vor pleca direct la designer pentru implementare.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 sm:p-8 space-y-8">
            {/* Secțiunea 1: Date de Contact și Identificare */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white border-b border-gray-700 pb-2">Date de Contact și Identificare</h2>

              <div>
                <label className="block text-brand-text-light mb-2">E-mail *</label>
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
                <label className="block text-brand-text-light mb-2">Parolă (pentru acces cont) *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Funcția *</label>
                <input
                  type="text"
                  name="profesie"
                  value={formData.profesie}
                  onChange={handleChange}
                  placeholder="Ex: Director Executiv"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.profesie && <p className="text-red-400 text-sm mt-1">{errors.profesie}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Organizația pe care o reprezinți *</label>
                <input
                  type="text"
                  name="organizatie"
                  value={formData.organizatie}
                  onChange={handleChange}
                  placeholder="Ex: Compania X"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                {errors.organizatie && <p className="text-red-400 text-sm mt-1">{errors.organizatie}</p>}
              </div>
              
              <input type="hidden" name="telefon" value={formData.telefon || '0000000000'} />
            </div>

            {/* Secțiunea 2: Profile Social Media */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white border-b border-gray-700 pb-2">Profile Social Media</h2>

              <div>
                <label className="block text-brand-text-light mb-2">Link profil LinkedIn (ne ajută să te etichetăm în postarea AVE)</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Link profil Facebook (ne ajută să te etichetăm în postarea AVE)</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Link profil Instagram (ne ajută să te etichetăm în postarea AVE)</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
              </div>
            </div>

            {/* Secțiunea 3: Motivație și Foto */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-white border-b border-gray-700 pb-2">Motivație și Foto</h2>

              <div>
                <label className="block text-brand-text-light mb-2">
                  Text (maximum 400 caractere, spații și simboluri incluse) în care descrii motivul pentru care ai acceptat rolul de jurat și schimbarea pe care Directorii Anului crezi că o au în educație. Textul va fi publicat în secțiunea de juriu a Galei. *
                </label>
                <textarea
                  name="motivatie"
                  value={formData.motivatie}
                  onChange={handleChange}
                  rows={6}
                  maxLength={400}
                  placeholder="Descrie motivația ta..."
                  className="w-full px-4 py-3 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button"
                />
                <p className="text-sm text-brand-text-light mt-1">
                  {formData.motivatie.length} / 400 caractere maxime
                </p>
                {errors.motivatie && <p className="text-red-400 text-sm mt-1">{errors.motivatie}</p>}
              </div>

              <div>
                <label className="block text-brand-text-light mb-2">Poză portret în format JPEG/PNG. Rezoluție minimă pe înălțime - 1000pixeli. Ideal, imaginea ar trebui să încadreze partea superioară a corpului cu puțin spațiu liber în jurul capului.</label>
                
                <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-white text-gray-800 font-bold py-2 px-4 rounded border border-gray-400 hover:bg-gray-100">
                        Alege Fișier
                        <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setFormData(prev => ({...prev, foto_url: reader.result as string}));
                                };
                                reader.readAsDataURL(file);
                            }
                        }}/>
                    </label>
                    <span className="text-brand-text-light text-sm italic">{formData.foto_url ? 'Fișier selectat' : 'Niciun fișier selectat'}</span>
                </div>
                 <div className="mt-2">
                    <p className="text-xs text-brand-text-light mb-1">Sau introdu un link direct (opțional):</p>
                    <input
                    type="url"
                    name="foto_url"
                    value={formData.foto_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-md bg-brand-input-bg text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-button text-sm"
                    />
                </div>
              </div>
            </div>

            {/* Secțiunea 4: GDPR */}
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-brand-white border-b border-gray-700 pb-2">Finalizare</h2>
               
               <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acordGDPR"
                  checked={formData.acordGDPR}
                  onChange={handleChange}
                  className="mt-1 mr-3 w-5 h-5"
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

            <div className="flex justify-end pt-6 border-t border-gray-700">
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 bg-brand-button text-brand-white font-bold rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Se trimite...' : 'TRIMITE FORMULARUL'}
                    </button>
                    <p className="text-xs text-brand-text-light max-w-md text-right hidden sm:block">
                        Pentru că ne dorim să avem același orizont de așteptare, te rog să ai în vedere că actualizările pe website și postările din social media, se publică de îndată ce întrunim condițiile de mai sus.
                    </p>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default App;
