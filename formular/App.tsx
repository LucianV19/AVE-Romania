

import React, { useState, useEffect, useRef, Suspense, useLayoutEffect } from 'react';
import { FormData, FormErrors, ThemeColors, ProiectNarativ, UploadedFile } from './types';
import { STEPS, NIVELURI_INVATAMANT, CATEGORII_PROIECT, DEADLINE_LABEL } from './constants';
import ProgressBar from './components/ProgressBar';
import CompletionProgressBar from './components/CompletionProgressBar';
const Step1_Applicant = React.lazy(() => import('./components/steps/Step1_Applicant'));
const Step2_Organization = React.lazy(() => import('./components/steps/Step2_Organization'));
const Step3_UnitateInvatamant = React.lazy(() => import('./components/steps/Step3_UnitateInvatamant'));
const Step4_Statistici = React.lazy(() => import('./components/steps/Step4_Statistici'));
const Step5_Categorii = React.lazy(() => import('./components/steps/Step5_Categorii'));
const Step6_ProiecteNarative = React.lazy(() => import('./components/steps/Step6_ProiecteNarative'));
// const Step7_OnlinePresence = React.lazy(() => import('./components/steps/Step7_OnlinePresence'));
const Step8_Recomandari = React.lazy(() => import('./components/steps/Step8_Recomandari'));
const Step9_Review = React.lazy(() => import('./components/steps/Step9_Review'));
import Success from './components/Success';
import ThemeSettings from './components/ThemeSettings';
import AdminBypassButton from './components/AdminBypassButton';
import SettingsIcon from './components/icons/SettingsIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';
import Countdown from './components/Countdown';

const initialNiveluri = NIVELURI_INVATAMANT.reduce((acc, nivel) => {
  acc[nivel.id] = false;
  return acc;
}, {} as { [key: string]: boolean });

const initialCategorii = CATEGORII_PROIECT.reduce((acc, cat) => {
  acc[cat.id] = false;
  return acc;
}, {} as { [key: string]: boolean });

const initialProiectNarativ: ProiectNarativ = {
    modelInterventie: '', schimbariProduse: '', strategieComunicare: '',
    riscuriGestionate: '', indicatoriMasurati: '', continuitate: '',
    invataturi: '', relatieAutoritati: '', documenteJustificative: [],
};

const initialFormData: FormData = {
  email: '', confirmEmail: '', nume: '', prenume: '', telefon: '',
  functieInceputAn: '', functieInceputLuna: '', aniActivitateSistem: '', modOcupareFunctie: '', modOcupareDetalii: '', aniConducereAcumulati: '',
  judetUnitate: '', localitateUnitate: '', denumireUnitate: '', adresaUnitate: '', websiteUnitate: '', regiuneUnitate: '',
  niveluriInvatamant: initialNiveluri, arePersonalitateJuridica: '', unitateParinte: '',
  statistici: {
    eleviInscrisi: '', eleviRomi: '', eleviCES: '', eleviDezavantajati: '',
    eleviBursaSociala: '', eleviNavetisti: '', eleviAbandonScolar: '',
    personalDidacticTitular: '', personalDidacticSuplinitor: '', personalNedidactic: '',
  },
  categorii: initialCategorii,
  proiecteNarative: {},
  linkedinProfile: '', facebookProfile: '', otherProfile: '',
  recomandari: [], organizatiiReferinta: [],
  acordGDPR: false, acordRegulament: false,
};

const defaultTheme: ThemeColors = {
    bgStart: '#100E1D', bgEnd: '#16213e', inputBg: '#D7D2E8',
    textDark: '#2E234F', textLight: '#DCD8EC', button: '#575A89', white: '#FFFFFF',
};

type AppProps = {
  onHome?: () => void;
};

const App: React.FC<AppProps> = ({ onHome }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'validating' | 'submitting' | 'success'>('idle');
  const [justSaved, setJustSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [scrollToElementId, setScrollToElementId] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [targetStep, setTargetStep] = useState<number | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<ThemeColors>(() => {
    try {
      const savedTheme = localStorage.getItem('galaFormTheme');
      return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
    } catch (error) { return defaultTheme; }
  });

  useEffect(() => {
    setAnimationClass('animate-step-enter');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
        const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value as string);
    });
    localStorage.setItem('galaFormTheme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const savedData = localStorage.getItem('galaFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length > 0) {
          setShowResumePrompt(true);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const [deadlineLabel, setDeadlineLabel] = useState(DEADLINE_LABEL);

  useEffect(() => {
    try {
        const savedDeadline = localStorage.getItem('gala_deadline_config');
        if (savedDeadline) {
            const date = new Date(savedDeadline);
            // Format: "20 iulie 2026, ora 23:59"
            const months = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
            const formatted = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ora ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            setDeadlineLabel(formatted);
        }
    } catch {}
  }, []);

  useLayoutEffect(() => {
    if (scrollToElementId) return;
    const titleElement = stepContainerRef.current?.querySelector('h2');
    if (titleElement) titleElement.focus();
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep, scrollToElementId]);

  useEffect(() => {
    if (scrollToElementId) {
        const targetElement = document.getElementById(scrollToElementId);
        if (targetElement) {
            const animationFrameId = requestAnimationFrame(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.focus({ preventScroll: true });
                setScrollToElementId(null);
            });
            return () => cancelAnimationFrame(animationFrameId);
        } else {
            setScrollToElementId(null);
        }
    }
  }, [scrollToElementId]);

  useEffect(() => {
    if (animationClass === 'animate-step-exit' && targetStep !== null) {
      const timer = setTimeout(() => {
        setCurrentStep(targetStep);
        setTargetStep(null);
        setAnimationClass('animate-step-enter');
      }, 300); // Corresponds to the exit animation duration

      return () => clearTimeout(timer);
    }
  }, [animationClass, targetStep]);

  const trackEvent = (name: string, payload: any) => {
    try {
      const key = 'galaAnalyticsEvents';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const event = { name, payload, ts: Date.now() };
      localStorage.setItem(key, JSON.stringify([...prev, event]));
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
        navigator.sendBeacon('/analytics', blob);
      }
    } catch {}
  };

  const silentSaveProgress = () => {
    localStorage.setItem('galaFormData', JSON.stringify(formData));
    setLastSavedAt(Date.now());
    setHasUnsavedChanges(false);
  };

  const saveProgress = () => {
    silentSaveProgress();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const markDirty = () => setHasUnsavedChanges(true);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      silentSaveProgress();
    }, 10000);
    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges]);
  
  const handleDateChange = (name: { year: keyof FormData; month: keyof FormData }, year: string, month: string) => {
    setFormData(prev => ({ ...prev, [name.year]: year, [name.month]: month }));
    markDirty();
    if (errors[name.year]) setErrors(prev => ({ ...prev, [name.year]: undefined }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.currentTarget;
    let value: string | boolean = type === 'checkbox' ? (e.currentTarget as HTMLInputElement).checked : e.currentTarget.value;
    
    if (type === 'tel') {
      value = value.toString().replace(/[^0-9]/g, '').slice(0, 10);
    }

    if (type === 'number') {
      const numVal = parseInt(value.toString());
      if (numVal < 0) value = '0';
    }

    const nameParts = name.split('.');

    if (nameParts[0] === 'statistici' && nameParts.length === 2) {
        const key = nameParts[1] as keyof FormData['statistici'];
        setFormData(prev => ({ ...prev, statistici: { ...prev.statistici, [key]: value as string } }));
    } else if (nameParts[0] === 'proiecteNarative' && nameParts.length === 3) {
        const category = nameParts[1] as keyof FormData['proiecteNarative'];
        const field = nameParts[2] as keyof ProiectNarativ;
         setFormData(prev => ({
            ...prev,
            proiecteNarative: {
                ...prev.proiecteNarative,
                [category]: {
                    ...(prev.proiecteNarative[category] || initialProiectNarativ),
                    [field]: value,
                }
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    markDirty();
    
    if (errors[name as keyof FormData]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete (newErrors as any)[name];
            return newErrors;
        });
    }
  };
  
  const handleFileChange = (category: keyof FormData['proiecteNarative'], files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const fileId = `${file.name}-${Date.now()}`;
      const newFilePlaceholder: UploadedFile = { 
        id: fileId,
        name: file.name, 
        type: file.type, 
        content: '',
        progress: 0,
      };

      setFormData(prev => {
        const currentDocs = prev.proiecteNarative[category]?.documenteJustificative || [];
        return {
          ...prev,
          proiecteNarative: {
            ...prev.proiecteNarative,
            [category]: {
              ...(prev.proiecteNarative[category] || initialProiectNarativ),
              documenteJustificative: [...currentDocs, newFilePlaceholder],
            }
          }
        };
      });
      markDirty();

      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFormData(prev => {
            const currentDocs = prev.proiecteNarative[category]?.documenteJustificative || [];
            const updatedDocs = currentDocs.map(doc => 
              doc.id === fileId ? { ...doc, progress } : doc
            );
            return {
              ...prev,
              proiecteNarative: {
                ...prev.proiecteNarative,
                [category]: {
                  ...(prev.proiecteNarative[category] || initialProiectNarativ),
                  documenteJustificative: updatedDocs,
                }
              }
            };
          });
        }
      };
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
            setFormData(prev => {
              const currentDocs = prev.proiecteNarative[category]?.documenteJustificative || [];
               const updatedDocs = currentDocs.map(doc => 
                doc.id === fileId ? { ...doc, content, progress: 100 } : doc
              );
              return {
                ...prev,
                proiecteNarative: {
                  ...prev.proiecteNarative,
                  [category]: {
                    ...(prev.proiecteNarative[category] || initialProiectNarativ),
                    documenteJustificative: updatedDocs,
                  }
                }
              };
            });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileRemove = (category: keyof FormData['proiecteNarative'], fileId: string) => {
    setFormData(prev => {
      const currentDocs = prev.proiecteNarative[category]?.documenteJustificative || [];
      const updatedDocs = currentDocs.filter((file) => file.id !== fileId);
      return {
        ...prev,
        proiecteNarative: {
          ...prev.proiecteNarative,
          [category]: {
            ...(prev.proiecteNarative[category] || initialProiectNarativ),
            documenteJustificative: updatedDocs,
          }
        }
      };
    });
    markDirty();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Basic blur validation can be expanded here
  };

  const handleNiveluriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.currentTarget;
    setFormData(prev => ({ ...prev, niveluriInvatamant: { ...prev.niveluriInvatamant, [name]: checked } }));
    markDirty();
    if (errors.niveluriInvatamant) setErrors(prev => ({...prev, niveluriInvatamant: undefined}));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const selectedCount = Object.values(formData.categorii).filter(Boolean).length;
    
    if (checked && selectedCount >= 2) {
      setErrors(prev => ({...prev, categorii: 'Puteți selecta maximum două categorii.'}));
      return;
    }

    setFormData(prev => {
        const newCategorii = { ...prev.categorii, [name]: checked };
        const newProiecteNarative = { ...prev.proiecteNarative };
        if (checked && !newProiecteNarative[name as keyof typeof newProiecteNarative]) {
            newProiecteNarative[name as keyof typeof newProiecteNarative] = initialProiectNarativ;
        }
        return { ...prev, categorii: newCategorii, proiecteNarative: newProiecteNarative };
    });
    markDirty();
    setErrors(prev => ({...prev, categorii: undefined}));
  };

  const handleAddRecomandare = () => {
    setFormData(prev => ({ ...prev, recomandari: [...prev.recomandari, { id: `rec_${Date.now()}`, nume: '', functie: '', telefon: '', tip: '' }] }));
    markDirty();
  };
  const handleRemoveRecomandare = (index: number) => {
    setFormData(prev => ({ ...prev, recomandari: prev.recomandari.filter((_, i) => i !== index) }));
    markDirty();
  };
  const handleRecomandareChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'tel') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    const updatedRecomandari = formData.recomandari.map((item, i) => i === index ? { ...item, [name]: finalValue } : item);
    setFormData(prev => ({ ...prev, recomandari: updatedRecomandari }));
    markDirty();
  };

  const handleAddOrganizatie = () => {
    setFormData(prev => ({ ...prev, organizatiiReferinta: [...(prev.organizatiiReferinta || []), { id: `org_${Date.now()}`, nume: '', telefon: '' }] }));
    markDirty();
  };
  const handleRemoveOrganizatie = (index: number) => {
    setFormData(prev => ({ ...prev, organizatiiReferinta: (prev.organizatiiReferinta || []).filter((_, i) => i !== index) }));
    markDirty();
  };
  const handleOrganizatieChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'tel') finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    const updated = (formData.organizatiiReferinta || []).map((item, i) => i === index ? { ...item, [name]: finalValue } : item);
    setFormData(prev => ({ ...prev, organizatiiReferinta: updated }));
    markDirty();
  };

  const validateStep = (step = currentStep): boolean => {
    if (isAdminMode) return true;
    const newErrors: FormErrors = {};
    switch (step) {
      case 1:
        if (!formData.nume) newErrors.nume = 'Numele este obligatoriu.';
        if (!formData.prenume) newErrors.prenume = 'Prenumele este obligatoriu.';
        if (!formData.email) newErrors.email = 'Emailul este obligatoriu.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Adresa de email este invalidă.';
        
        if (!formData.confirmEmail) {
           newErrors.confirmEmail = 'Confirmarea adresei de email este obligatorie.';
        } else if (formData.email !== formData.confirmEmail) {
           newErrors.confirmEmail = 'Cele două adrese de email nu sunt identice.';
        }

        if (!formData.telefon) newErrors.telefon = 'Telefonul este obligatoriu.';
        else if (formData.telefon.toString().length !== 10) newErrors.telefon = 'Telefonul trebuie să aibă exact 10 cifre.';
        if (!formData.functieInceputAn) newErrors.functieInceputAn = 'Data începerii funcției este obligatorie.';
        if (!formData.functieInceputLuna) newErrors.functieInceputAn = 'Data începerii funcției este obligatorie.';
        if (!formData.aniActivitateSistem) newErrors.aniActivitateSistem = 'Acest câmp este obligatoriu.';
        if (!formData.modOcupareFunctie) newErrors.modOcupareFunctie = 'Acest câmp este obligatoriu.';
        if (formData.modOcupareFunctie === 'Altă situație' && !formData.modOcupareDetalii) newErrors.modOcupareDetalii = 'Vă rugăm detalii pentru „Altă situație”.';
        if (!formData.aniConducereAcumulati) newErrors.aniConducereAcumulati = 'Acest câmp este obligatoriu.';
        break;
      case 2:
        if (!formData.judetUnitate) newErrors.judetUnitate = 'Județul este obligatoriu.';
        if (!formData.denumireUnitate) newErrors.denumireUnitate = 'Denumirea este obligatorie.';
        if (!formData.adresaUnitate) newErrors.adresaUnitate = 'Adresa este obligatorie.';
        if (Object.values(formData.niveluriInvatamant).every(v => !v)) newErrors.niveluriInvatamant = 'Selectați cel puțin un nivel.';
        if (!formData.arePersonalitateJuridica) newErrors.arePersonalitateJuridica = 'Acest câmp este obligatoriu.';
        if (formData.arePersonalitateJuridica === 'nu' && !formData.unitateParinte) newErrors.unitateParinte = 'Unitatea de care aparține este obligatorie.';
        break;
      case 3:
        const statsErrors: { [K in keyof FormData['statistici']]?: string } = {};
        (Object.keys(formData.statistici) as Array<keyof FormData['statistici']>).forEach((key) => {
          if (!formData.statistici[key]) {
            statsErrors[key] = 'Câmp obligatoriu.';
          }
        });
        if (Object.keys(statsErrors).length > 0) {
          newErrors.statistici = statsErrors;
        }
        break;
      case 4:
        if (Object.values(formData.categorii).every(v => !v)) newErrors.categorii = 'Selectați cel puțin o categorie.';
        break;
      case 6:
        if (formData.recomandari.length < 3) {
           newErrors.recomandari = 'Vă rugăm să adăugați cel puțin 3 recomandări (persoane).';
        }
        if (!formData.organizatiiReferinta || formData.organizatiiReferinta.length < 1) {
           newErrors.organizatiiReferinta = 'Vă rugăm să adăugați cel puțin o organizație de referință.';
        }
        break;
      case 7:
        if (!formData.acordGDPR || !formData.acordRegulament) newErrors.acordRegulament = 'Ambele acorduri sunt necesare.';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateToStep = (step: number, elementId?: string) => {
    if (targetStep !== null || step === currentStep) return;

    const performNavigation = () => {
      setTargetStep(step);
      setAnimationClass('animate-step-exit');
      if (elementId) setScrollToElementId(elementId);
    };

    if (step > currentStep) {
      if (validateStep()) {
        silentSaveProgress();
        trackEvent('step_navigate', { from: currentStep, to: step });
        performNavigation();
      }
      else {
        trackEvent('validation_block', { step: currentStep });
      }
    } else {
      silentSaveProgress();
      trackEvent('step_navigate', { from: currentStep, to: step });
      performNavigation();
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      navigateToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1);
    }
  };

  const goToStep = (step: number, elementId?: string) => {
    navigateToStep(step, elementId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(7)) {
      setIsSubmitting(true);
      setSubmissionStatus('submitting');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form data submitted:', formData);
      trackEvent('form_submit', { step: currentStep });
      localStorage.setItem('galaFormData', JSON.stringify(formData));
      localStorage.setItem('galaSubmissionPending', 'true');
      setSubmissionStatus('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleHome = () => {
    if (hasUnsavedChanges && !window.confirm('Ai modificări nesalvate. Sigur vrei să ieși?')) {
      return;
    }
    if (onHome) {
      onHome();
      return;
    }
    const ref = document.referrer;
    if (ref) {
      try {
        const u = new URL(ref);
        window.location.assign(`${u.origin}/`);
        return;
      } catch {}
    }
    window.location.assign('/');
  };

  if (isSubmitted) return <Success userName={formData.prenume} onHome={handleHome} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 relative">
        <div className="absolute top-4 left-4 flex items-center gap-3 z-20 print:hidden">
          <button
            type="button"
            onClick={handleHome}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300 text-brand-white text-sm font-bold"
          >
            ← Acasă
          </button>
          <div className="text-xs text-brand-text-light/80">
            {hasUnsavedChanges
              ? 'Modificări nesalvate'
              : lastSavedAt
                ? `Salvat ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : ''}
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20 print:hidden">
            <AdminBypassButton isAdmin={isAdminMode} onToggle={() => setIsAdminMode(!isAdminMode)} />
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-button" aria-label="Theme Settings">
              <SettingsIcon />
            </button>
        </div>
        <ThemeSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} resetTheme={() => setTheme(defaultTheme)} />
        {showResumePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-brand-bg/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-brand-white">Am găsit un draft salvat</h3>
              <p className="text-sm text-brand-text-light mt-2">Vrei să continui completarea sau să începi din nou?</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowResumePrompt(false)}
                  className="flex-1 py-3 px-4 rounded-lg bg-brand-button text-brand-white font-bold hover:bg-opacity-90 transition-colors"
                >
                  Continuă
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('galaFormData');
                    localStorage.removeItem('galaSubmissionPending');
                    setFormData(initialFormData);
                    setErrors({});
                    setCurrentStep(1);
                    setHasUnsavedChanges(false);
                    setLastSavedAt(null);
                    setShowResumePrompt(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-lg bg-white/10 text-brand-white font-bold hover:bg-white/20 transition-colors"
                >
                  Începe din nou
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl py-4 sm:py-12">
             <header className="text-center mb-8 sm:mb-12">
                <div className="inline-block border border-brand-text-light p-2 mb-4 sm:mb-8">
                  <p className="text-sm font-bold tracking-wider">GALA PREMIILOR</p>
                  <p className="text-xs">PENTRU DIRECTORII ANULUI 2026</p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white mb-4">Înscrie-te acum la Premiile pentru Directorii Anului 2026!</h1>
                <div className="text-sm sm:text-base text-brand-text-light max-w-3xl mx-auto space-y-2">
                    <p>Termen limită de înscriere pentru directorii și directorii adjuncți ai unităților de învățământ - {deadlineLabel}.</p>
                    <div className="bg-white/10 p-4 rounded-md text-left mt-4 border border-white/20">
                      <h3 className="text-lg font-bold text-brand-white mb-2">Indicații de completare a formularului de înscriere</h3>
                      <p className="mb-2">Completarea formularului durează aproximativ <strong className="text-brand-white">2 ore</strong> și are în vedere o serie de informații și documente suplimentare, care necesită pregătire în prealabil.</p>
                      <p className="mb-4">Poți consulta <strong>Regulamentul Competiției</strong> <a href="#" className="text-blue-400 underline hover:text-blue-300">AICI</a>.</p>
                      
                      <h4 className="text-brand-white font-bold mb-2">Bine de știut:</h4>
                      <ul className="list-disc list-outside ml-5 space-y-2 text-sm">
                        <li>Formularul este structurat pe 3 secțiuni și mai multe pagini. Apăsând butonul „Salvează progresul” de la finalul fiecărei pagini, ceea ce ai completat deja va fi transmis pe e-mailul confirmat în pagina de deschidere.</li>
                        <li>Poți continua completarea formularului oricând, accesând din nou linkul de înscriere pe care îl primești pe e-mail și alegând butonul „Continuă editarea”.</li>
                        <li>Te poți înscrie pentru maximum 2 dintre cele 3 categorii, respectiv Inovare, Egalitate de Șanse și Antreprenoriat.</li>
                        <li>În cazul în care întâmpini dificultăți în completarea formularului sau dacă te putem sprijini cu detalii suplimentare, în spatele adresei de e-mail <a href="mailto:gala@ave-romania.ro" className="text-blue-400 underline">gala@ave-romania.ro</a> este cineva pregătit să îți răspundă în maximum 3 zile lucrătoare.</li>
                        <li>Toate întrebările care au semnul <span className="text-red-400">*</span> sunt obligatorii.</li>
                      </ul>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-8">
                  <Countdown />
                </div>
             </header>
            
            <div ref={formSectionRef}>
              <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
              <CompletionProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

              <div ref={stepContainerRef} className={animationClass}>
                <Suspense fallback={<div className="text-brand-text-light text-center py-8">Se încarcă...</div>}>
                <form onSubmit={handleSubmit} noValidate>
                    <div role="status" aria-live="polite" className="sr-only">{Object.keys(errors).length > 0 ? 'Există erori de completare în formular.' : ''}</div>
                    {currentStep === 1 && (
                      <div>
                        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white mb-8 text-center focus:outline-none">Contact și Experiență</h2>
                        <Step1_Applicant data={formData} handleChange={handleChange} errors={errors} handleBlur={handleBlur} />
                        <Step2_Organization data={formData} handleChange={handleChange} handleDateChange={handleDateChange} errors={errors} userName={formData.prenume} />
                      </div>
                    )}
                    {currentStep === 2 && <Step3_UnitateInvatamant data={formData} handleChange={handleChange} handleNiveluriChange={handleNiveluriChange} errors={errors} userName={formData.prenume} />}
                    {currentStep === 3 && <Step4_Statistici data={formData} handleChange={handleChange} errors={errors} userName={formData.prenume} />}
                    {currentStep === 4 && <Step5_Categorii data={formData.categorii} handleCategoryChange={handleCategoryChange} errors={errors} userName={formData.prenume} />}
                    {currentStep === 5 && <Step6_ProiecteNarative data={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} errors={errors} userName={formData.prenume} />}
                    {currentStep === 6 && (
                      <Step8_Recomandari
                        data={formData}
                        onAddRecomandare={handleAddRecomandare}
                        onRemoveRecomandare={handleRemoveRecomandare}
                        onRecomandareChange={handleRecomandareChange}
                        onAddOrganizatie={handleAddOrganizatie}
                        onRemoveOrganizatie={handleRemoveOrganizatie}
                        onOrganizatieChange={handleOrganizatieChange}
                        userName={formData.prenume}
                      />
                    )}
                    {currentStep === 7 && <Step9_Review data={formData} handleChange={handleChange} errors={errors} goToStep={goToStep} userName={formData.prenume} />}
                    {currentStep === 8 && <Step8_Recomandari data={formData} onAddRecomandare={handleAddRecomandare} onRemoveRecomandare={handleRemoveRecomandare} onRecomandareChange={handleRecomandareChange} userName={formData.prenume} />}
                    {currentStep === 9 && <Step9_Review data={formData} handleChange={handleChange} errors={errors} goToStep={goToStep} userName={formData.prenume} />}
                    
                    <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-4 print:hidden">
                        <button type="button" onClick={saveProgress} disabled={justSaved} className={`py-3 px-5 sm:px-6 text-sm text-brand-white font-bold uppercase rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg transition-all duration-300 w-full sm:w-auto ${justSaved ? 'bg-green-600 focus:ring-green-500' : 'bg-transparent border-2 border-brand-button hover:bg-brand-button focus:ring-brand-button'}`}>
                           {justSaved ? 'PROGRES SALVAT!' : 'SALVEAZĂ PROGRESUL'}
                        </button>
                        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-4">
                            {currentStep > 1 && <button type="button" onClick={handlePrev} className="py-3 px-5 sm:px-6 text-sm bg-transparent border-2 border-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-brand-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300 w-full sm:w-auto">ÎNAPOI</button>}
                            {currentStep < STEPS.length && <button type="button" onClick={handleNext} className="py-3 px-5 sm:px-6 text-sm bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300 w-full sm:w-auto">PASUL URMĂTOR</button>}
                            {currentStep === STEPS.length && <button type="submit" disabled={isSubmitting} className="py-3 px-5 sm:px-6 text-sm bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300 w-full sm:w-auto flex items-center justify-center disabled:opacity-70">{isSubmitting ? <><SpinnerIcon /><span className="ml-2">SE TRIMITE...</span></> : 'TRIMITE FORMULARUL'}</button>}
                        </div>
                    </div>
                </form>
                </Suspense>
            </div>
        </div>
    </div>
  </div>
  );
};

export default App;
