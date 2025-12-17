import React, { useMemo, useState, useEffect } from 'react';
import { Assignment, Candidat, Category, Jurat, Status, Criterion } from '../../types';
import { XMarkIcon } from './icons';
import CandidateSubmissionView from './CandidateSubmissionView';

interface Props {
  open: boolean;
  candidate: Candidat;
  assignment: Assignment;
  category?: Category;
  currentJudge: Jurat;
  criteria: Criterion[];
  onClose: () => void;
  onUpdateAssignment: (updated: Assignment) => void;
  isAnonymized?: boolean;
}

const CRITERIA_DEMO = [
  { id: 'impact', label: 'Impact asupra elevilor și comunității', helper: 'Evaluează rezultatele și beneficiile vizibile.' },
  { id: 'egalitate', label: 'Egalitate de șanse și incluziune', helper: 'Măsoară accesul echitabil și sprijinul pentru grupuri vulnerabile.' },
  { id: 'inovare', label: 'Inovare și creativitate', helper: 'Gradul de noutate și originalitate al intervenției.' },
  { id: 'management', label: 'Managementul resurselor', helper: 'Eficiența utilizării resurselor umane și materiale.' },
  { id: 'sustenabilitate', label: 'Sustenabilitate și scalabilitate', helper: 'Durabilitatea și potențialul de replicare/extindere.' },
];

const CandidateEvaluationModal: React.FC<Props> = ({ open, candidate, assignment, category, currentJudge, criteria, onClose, onUpdateAssignment, isAnonymized }) => {
  const [activeTab, setActiveTab] = useState<'text'>('text');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [commentsIntern, setCommentsIntern] = useState<string>('');
  const [feedbackCandidat, setFeedbackCandidat] = useState<string>('');
  const [dynamicCriteria, setDynamicCriteria] = useState<{ id: string; label: string; helper: string }[]>(CRITERIA_DEMO);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const hasAny = Object.values(scores).some(v => typeof v === 'number');
    if (hasAny && assignment.status === Status.NEINCEPUT) {
      onUpdateAssignment({ ...assignment, status: Status.IN_CURS, lastModified: new Date() });
    }
  }, [scores, assignment, onUpdateAssignment]);

  const relevantCriteria = useMemo(() => {
    return (Array.isArray(criteria)) ? criteria.filter(c => c.etapaId === assignment.etapaId && c.categorieId === assignment.categorieId) : [];
  }, [criteria, assignment.etapaId, assignment.categorieId]);

  const helpersById = useMemo(() => {
    const map: Record<string, string> = {};
    dynamicCriteria.forEach(dc => { map[dc.id] = dc.helper; });
    return map;
  }, [dynamicCriteria]);

  const finalAverage = useMemo(() => {
    if (!relevantCriteria || relevantCriteria.length === 0) {
      const values = Object.values(scores).filter(v => typeof v === 'number');
      if (values.length === 0) return 0;
      return values.reduce((a, b) => a + b, 0);
    }
    
    return relevantCriteria.reduce((acc, c) => acc + (scores[c.id] ?? 0), 0);
  }, [scores, relevantCriteria]);

  const maxPossibleScore = useMemo(() => {
    if (!relevantCriteria || relevantCriteria.length === 0) return 10 * dynamicCriteria.length;
    return relevantCriteria.reduce((acc, c) => acc + ('scorMax' in c ? c.scorMax : 10), 0);
  }, [relevantCriteria, dynamicCriteria]);

  const handleScore = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveDraft = () => {
    const updated: Assignment = { ...assignment, status: Status.IN_CURS, scorFinal: finalAverage, lastModified: new Date() };
    onUpdateAssignment(updated);
  };

  const handleSubmitFinal = () => {
    const updated: Assignment = { ...assignment, status: Status.FINALIZAT, scorFinal: finalAverage, lastModified: new Date() };
    onUpdateAssignment(updated);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-start justify-center p-0 sm:p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-6xl h-[92vh] sm:max-h-[90vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-ave-dark-blue dark:text-slate-100 truncate">Evaluare candidat – {category?.nume || 'Categorie necunoscută'}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{isAnonymized ? `Candidat ${candidate.id}` : candidate.nume} • {isAnonymized ? 'Unitate de învățământ' : candidate.scoala} • {candidate.regiune}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Jurizat de: {currentJudge.nume}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${assignment.status === Status.FINALIZAT ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : assignment.status === Status.IN_CURS ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>{assignment.status}</span>
              <button onClick={onClose} aria-label="Închide evaluarea" className="p-2 rounded-md text-gray-600 dark:text-slate-300"><XMarkIcon className="w-6 h-6" /></button>
            </div>
          </div>
        </header>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
          <div className="border-r dark:border-slate-700 flex flex-col min-h-0">
            <div className="p-4 border-b dark:border-slate-700 sticky top-0 z-10 bg-white dark:bg-slate-800">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full sm:hidden" />
              <h4 className="text-base font-bold text-ave-dark-blue dark:text-slate-100">Lucrarea candidatului</h4>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setActiveTab('text')} className={`px-3 py-1.5 text-sm rounded-md font-semibold ${activeTab === 'text' ? 'bg-ave-blue text-white' : 'bg-gray-100 dark:bg-slate-700 text-ave-dark-blue dark:text-slate-100'}`}>Formular Înscriere</button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto min-h-0">
              <div className="p-4 space-y-4">
                {activeTab === 'text' && (
                  <div className="border rounded-none sm:rounded-lg">
                    <CandidateSubmissionView candidate={candidate} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col min-h-0">
            <div className="p-4 border-b dark:border-slate-700">
              <h4 className="text-base font-bold text-ave-dark-blue dark:text-slate-100">Grilă de evaluare</h4>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {(relevantCriteria.length > 0 ? relevantCriteria : dynamicCriteria).map(c => (
                <div key={c.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">{'nume' in c ? c.nume : c.label}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{'descriere' in c && c.descriere ? c.descriere : helpersById[c.id]}</p>
                    </div>
                    <div className="text-ave-blue font-bold text-xl w-16 text-right">{scores[c.id] ?? 0}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="number"
                      aria-describedby={`help-${c.id}`}
                      min={'scorMin' in c ? c.scorMin : 1}
                      max={'scorMax' in c ? c.scorMax : 10}
                      value={scores[c.id] ?? ''}
                      placeholder="0"
                      onChange={e => {
                        const valStr = e.target.value;
                        if (valStr === '') {
                            const newScores = { ...scores };
                            delete newScores[c.id];
                            setScores(newScores);
                            return;
                        }
                        const raw = parseInt(valStr, 10);
                        const min = 'scorMin' in c ? c.scorMin : 1;
                        const max = 'scorMax' in c ? c.scorMax : 10;
                        
                        // Allow typing, validate on blur or just show error
                        setScores(prev => ({ ...prev, [c.id]: raw }));
                        setErrors(prev => ({ ...prev, [c.id]: raw < min || raw > max ? `Valoarea trebuie între ${min} și ${max}.` : '' }));
                      }}
                      className="w-24 p-2 border border-gray-300 dark:border-slate-600 rounded-md text-center font-bold text-lg focus:ring-2 focus:ring-ave-blue focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                    <span className="text-sm text-gray-500 dark:text-slate-400">/ {'scorMax' in c ? c.scorMax : 10} puncte</span>
                  </div>
                  <div id={`help-${c.id}`} className="mt-1 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">Interval permis: {'scorMin' in c ? c.scorMin : 1}–{'scorMax' in c ? c.scorMax : 10}</span>
                    {errors[c.id] && <span className="text-[11px] text-red-600 dark:text-red-400">{errors[c.id]}</span>}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Scor final:</span>
                <p className="text-3xl font-extrabold text-ave-blue">{finalAverage.toFixed(1)} / {maxPossibleScore}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Comentarii pentru juriu (intern)</p>
                <textarea rows={4} value={commentsIntern} onChange={e => setCommentsIntern(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Feedback pentru candidat (opțional)</p>
                <textarea rows={3} value={feedbackCandidat} onChange={e => setFeedbackCandidat(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
              </div>
            </div>
            <div className="p-4 border-t dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={handleSaveDraft} className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Salvează draft</button>
              <button onClick={handleSubmitFinal} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue">Trimite scorul final</button>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border dark:border-slate-600">Înapoi la lista de candidați</button>
            </div>
          </div>
        </div>

        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
            <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <img src={candidate.pozaUrl} alt="Preview" className="w-full h-auto rounded-lg" />
              <div className="mt-3 flex items-center justify-between">
                <button onClick={() => setLightboxIndex(null)} className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-slate-700 text-sm">Închide</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateEvaluationModal;
