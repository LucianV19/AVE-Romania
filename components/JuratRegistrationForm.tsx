import React, { useState, useEffect } from 'react';
import { View } from '../types';

interface JuratFormData {
  prenume: string;
  nume: string;
  functie: string;
  responsabilitati: string[];
  linkedinProfile: string;
  facebookProfile: string;
  otherProfile: string;
  recomandari: string;
  foto_url?: string;
  acordGDPR: boolean;
  acordRegulament: boolean;
}

interface JuratRegistrationFormProps {
  onSubmit: (formData: JuratFormData) => void;
  onCancel: () => void;
}

const JuratRegistrationForm: React.FC<JuratRegistrationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<JuratFormData>({
    prenume: '',
    nume: '',
    functie: '',
    responsabilitati: [],
    linkedinProfile: '',
    facebookProfile: '',
    otherProfile: '',
    recomandari: '',
    foto_url: '',
    acordGDPR: false,
    acordRegulament: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const responsabilitatiOptions = [
    'Conducere instituție de învățământ',
    'Conducere departament',
    'Conducere program educațional',
    'Inițiative educaționale',
    'Proiecte și parteneriate',
    'Calitatea educației',
    'Incluziune și diversitate',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, foto_url: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleResponsabilitatiChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      responsabilitati: prev.responsabilitati.includes(option)
        ? prev.responsabilitati.filter(r => r !== option)
        : [...prev.responsabilitati, option],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenume.trim()) newErrors.prenume = 'Prenumele este obligatoriu';
    if (!formData.nume.trim()) newErrors.nume = 'Numele este obligatoriu';
    if (!formData.functie.trim()) newErrors.functie = 'Funcția este obligatorie';
    if (formData.responsabilitati.length === 0) newErrors.responsabilitati = 'Selectează cel puțin o responsabilitate';
    if (!formData.acordGDPR) newErrors.acordGDPR = 'Trebuie să accepți GDPR';
    if (!formData.acordRegulament) newErrors.acordRegulament = 'Trebuie să accepți regulamentul';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage
      const juratData = {
        ...formData,
        id: `jurat_${Date.now()}`,
        submitDate: new Date().toISOString(),
      };
      localStorage.setItem('juratFormData', JSON.stringify(juratData));
      localStorage.setItem('juratSubmissionPending', 'true');

      setSubmitted(true);
      onSubmit(formData);

      // Show success for 2 seconds then reset
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          prenume: '',
          nume: '',
          functie: '',
          responsabilitati: [],
          linkedinProfile: '',
          facebookProfile: '',
          otherProfile: '',
          recomandari: '',
          acordGDPR: false,
          acordRegulament: false,
        });
      }, 2000);
    } catch (error) {
      setErrors({ submit: 'Eroare la trimiterea formularului. Te rog încearcă din nou.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/50 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-2">Formular Trimis cu Succes!</h2>
            <p className="text-emerald-200 mb-6">
              Mulțumim! Candidatura ta ca jurat a fost primită. Te vom contacta în curând cu detalii despre etapele următoare.
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Înapoi la pagina principală
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onCancel}
          className="mb-6 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
        >
          ← Înapoi
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚖️ Formular Înregistrare Jurat</h1>
          <p className="text-purple-200">
            Completează formularul pentru a participa ca jurat la Gala Premiilor pentru Directorii Anului 2025
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Info Banner */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <p className="text-blue-200 text-sm">
              <span className="font-semibold">ℹ️ Dreptul juridic:</span> Prin participarea ca jurat, confirms că ești o personalitate cu o carieră importantă în educație și ești dispus/ă să evaluezi candidații conform criteriilor de jurizare. Datele tale vor fi tratate confidențial conform GDPR.
            </p>
          </div>

          {/* Personal Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Informații Personale</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prenume */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prenume *
                </label>
                <input
                  type="text"
                  name="prenume"
                  value={formData.prenume}
                  onChange={handleInputChange}
                  placeholder="Ion"
                  className={`w-full px-4 py-2 rounded-lg bg-slate-700/50 border ${
                    errors.prenume ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.prenume && <p className="text-red-400 text-sm mt-1">{errors.prenume}</p>}
              </div>

              {/* Nume */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nume *
                </label>
                <input
                  type="text"
                  name="nume"
                  value={formData.nume}
                  onChange={handleInputChange}
                  placeholder="Popescu"
                  className={`w-full px-4 py-2 rounded-lg bg-slate-700/50 border ${
                    errors.nume ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.nume && <p className="text-red-400 text-sm mt-1">{errors.nume}</p>}
              </div>
            </div>

            {/* Funcție */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Funcție/Poziție *
                </label>
                <input
                  type="text"
                  name="functie"
                  value={formData.functie}
                  onChange={handleInputChange}
                  placeholder="ex: Director, Rector, Inspector Școlar..."
                  className={`w-full px-4 py-2 rounded-lg bg-slate-700/50 border ${
                    errors.functie ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.functie && <p className="text-red-400 text-sm mt-1">{errors.functie}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Poză Profil (Opțional)</label>
                  <div className="flex items-center gap-4">
                      {formData.foto_url && (
                          <img src={formData.foto_url} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                      )}
                      <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" 
                      />
                  </div>
              </div>
            </div>
          </div>

          {/* Responsabilități */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Responsabilități și Experiență *</h2>
            <p className="text-slate-400 text-sm mb-4">Selectează-ți ariile de competență (min. 1)</p>

            <div className="space-y-3">
              {responsabilitatiOptions.map((option) => (
                <label key={option} className="flex items-center p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.responsabilitati.includes(option)}
                    onChange={() => handleResponsabilitatiChange(option)}
                    className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-slate-300">{option}</span>
                </label>
              ))}
            </div>

            {errors.responsabilitati && (
              <p className="text-red-400 text-sm mt-3">{errors.responsabilitati}</p>
            )}
          </div>

          {/* Social Profiles */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Prezenţă Online (Opțional)</h2>

            <div className="space-y-6">
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profil LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/ionpopescu"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profil Facebook
                </label>
                <input
                  type="url"
                  name="facebookProfile"
                  value={formData.facebookProfile}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/ionpopescu"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Alte profile */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Alte platforme / Website personal
                </label>
                <input
                  type="url"
                  name="otherProfile"
                  value={formData.otherProfile}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Recomandări */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Mesaj Suplimentar (Opțional)</h2>
            <p className="text-slate-400 text-sm mb-4">Spune-ne de ce consideri că ești potrivit/ă să fii jurat în această gală</p>

            <textarea
              name="recomandari"
              value={formData.recomandari}
              onChange={handleInputChange}
              placeholder="Scrie-ți motivația și experința relevantă..."
              rows={5}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-slate-400 text-xs mt-2">Max 500 de cuvinte</p>
          </div>

          {/* Consents */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Acorduri și Condiții</h2>

            <div className="space-y-4">
              {/* GDPR */}
              <label className="flex items-start p-4 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors border border-slate-700/50">
                <input
                  type="checkbox"
                  name="acordGDPR"
                  checked={formData.acordGDPR}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-1 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3 text-slate-300 text-sm">
                  <span className="font-semibold">Acordul GDPR:</span> Consimț la colectarea, prelucrarea și stocarea datelor mele personale conform GDPR. Datele vor fi utilizate exclusiv pentru scopul acestei gale.
                </span>
              </label>

              {errors.acordGDPR && <p className="text-red-400 text-sm ml-8">{errors.acordGDPR}</p>}

              {/* Regulament */}
              <label className="flex items-start p-4 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors border border-slate-700/50">
                <input
                  type="checkbox"
                  name="acordRegulament"
                  checked={formData.acordRegulament}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-1 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3 text-slate-300 text-sm">
                  <span className="font-semibold">Accept regulamentul:</span> Citesc și accept regulamentul complet al Galei Premiilor pentru Directorii Anului 2025 și mă angajez să respect principiile de imparțialitate și profesionalism.
                </span>
              </label>

              {errors.acordRegulament && <p className="text-red-400 text-sm ml-8">{errors.acordRegulament}</p>}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-500/30 p-4">
              <p className="text-red-300">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-200 text-lg"
            >
              {submitting ? '⏳ Se trimite...' : '📤 Trimite Formularul'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="py-4 px-6 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Anulează
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-slate-400 text-xs">
            * Câmpurile marcate cu asterisk sunt obligatorii
          </p>
        </form>
      </div>
    </div>
  );
};

export default JuratRegistrationForm;
