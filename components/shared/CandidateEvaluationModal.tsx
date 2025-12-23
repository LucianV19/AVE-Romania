import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  const [scores, setScores] = useState<Record<string, number>>({});
  const [commentsIntern, setCommentsIntern] = useState<string>('');
  const [feedbackCandidat, setFeedbackCandidat] = useState<string>('');
  const [dynamicCriteria, setDynamicCriteria] = useState<{ id: string; label: string; helper: string }[]>(CRITERIA_DEMO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobilePane, setMobilePane] = useState<'submission' | 'scoring'>('scoring');
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({ mare: true, medie: true, mica: true, alte: true });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const lastAutoSavedRef = useRef<string>('');

  useEffect(() => {
    const hasAny = Object.values(scores).some(v => typeof v === 'number');
    if (hasAny && assignment.status === Status.NEINCEPUT) {
      onUpdateAssignment({ ...assignment, status: Status.IN_CURS, lastModified: new Date() });
    }
  }, [scores, assignment, onUpdateAssignment]);

  useEffect(() => {
    setScores(assignment.scoruri || {});
    setSubmitAttempted(false);
    setErrors({});
  }, [assignment.id]);

  const relevantCriteria = useMemo(() => {
    return (Array.isArray(criteria)) ? criteria.filter(c => c.etapaId === assignment.etapaId && c.categorieId === assignment.categorieId) : [];
  }, [criteria, assignment.etapaId, assignment.categorieId]);

  const displayedCriteria = useMemo(() => {
    if (relevantCriteria.length > 0) return relevantCriteria;
    return dynamicCriteria.map(dc => ({ id: dc.id, etapaId: assignment.etapaId, categorieId: assignment.categorieId, nume: dc.label, descriere: dc.helper, scorMin: 1, scorMax: 10 } as Criterion));
  }, [relevantCriteria, dynamicCriteria, assignment.etapaId, assignment.categorieId]);

  const groupedCriteria = useMemo(() => {
    const groups: Record<string, Criterion[]> = { mare: [], medie: [], mica: [], alte: [] };
    displayedCriteria.forEach(c => {
      if (c.scorMax >= 8) groups.mare.push(c);
      else if (c.scorMax >= 5) groups.medie.push(c);
      else if (c.scorMax >= 1) groups.mica.push(c);
      else groups.alte.push(c);
    });
    return groups;
  }, [displayedCriteria]);

  const helpersById = useMemo(() => {
    const map: Record<string, string> = {};
    dynamicCriteria.forEach(dc => { map[dc.id] = dc.helper; });
    return map;
  }, [dynamicCriteria]);

  const finalAverage = useMemo(() => {
    return displayedCriteria.reduce((acc, c) => acc + (scores[c.id] ?? 0), 0);
  }, [scores, displayedCriteria]);

  const maxPossibleScore = useMemo(() => {
    return displayedCriteria.reduce((acc, c) => acc + c.scorMax, 0);
  }, [displayedCriteria]);

  const missingCount = useMemo(() => {
    return displayedCriteria.filter(c => scores[c.id] === undefined).length;
  }, [displayedCriteria, scores]);

  const handleScore = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleClearScore = (id: string) => {
    setScores(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const validateCriterion = (criterion: Criterion, value: number | undefined) => {
    if (value === undefined) return '';
    if (Number.isNaN(value)) return `Valoarea trebuie între ${criterion.scorMin} și ${criterion.scorMax}.`;
    if (value < criterion.scorMin || value > criterion.scorMax) return `Valoarea trebuie între ${criterion.scorMin} și ${criterion.scorMax}.`;
    return '';
  };

  const scrollToCriterion = (criterionId: string) => {
    const el = document.getElementById(`criterion-${criterionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (assignment.status === Status.FINALIZAT) return;
    const payload = JSON.stringify({ id: assignment.id, status: assignment.status, scores, scorFinal: finalAverage });
    if (payload === lastAutoSavedRef.current) return;

    const t = window.setTimeout(() => {
      lastAutoSavedRef.current = payload;
      onUpdateAssignment({
        ...assignment,
        status: assignment.status === Status.NEINCEPUT ? Status.IN_CURS : assignment.status,
        scoruri: scores,
        scorFinal: finalAverage,
        lastModified: new Date(),
      });
    }, 900);

    return () => window.clearTimeout(t);
  }, [scores, finalAverage, assignment, onUpdateAssignment]);

  const handleSaveDraft = () => {
    const updated: Assignment = { ...assignment, status: Status.IN_CURS, scoruri: scores, scorFinal: finalAverage, lastModified: new Date() };
    onUpdateAssignment(updated);
  };

  const handleSubmitFinal = () => {
    setSubmitAttempted(true);
    const nextErrors: Record<string, string> = {};
    displayedCriteria.forEach(c => {
      const err = validateCriterion(c, scores[c.id]);
      if (err) nextErrors[c.id] = err;
      if (scores[c.id] === undefined) nextErrors[c.id] = 'Câmp obligatoriu.';
    });
    setErrors(nextErrors);

    const firstMissing = displayedCriteria.find(c => scores[c.id] === undefined);
    const firstError = displayedCriteria.find(c => nextErrors[c.id]);
    const firstIssue = firstMissing || firstError;
    if (firstIssue) {
      setMobilePane('scoring');
      const groupKey = firstIssue.scorMax >= 8 ? 'mare' : firstIssue.scorMax >= 5 ? 'medie' : 'mica';
      setGroupOpen(prev => ({ ...prev, [groupKey]: true }));
      scrollToCriterion(firstIssue.id);
      return;
    }

    const updated: Assignment = { ...assignment, status: Status.FINALIZAT, scoruri: scores, scorFinal: finalAverage, lastModified: new Date() };
    onUpdateAssignment(updated);
    onClose();
  };

  const handleJumpToNextMissing = () => {
    const missing = displayedCriteria.find(c => scores[c.id] === undefined);
    if (!missing) return;
    setMobilePane('scoring');
    const groupKey = missing.scorMax >= 8 ? 'mare' : missing.scorMax >= 5 ? 'medie' : 'mica';
    setGroupOpen(prev => ({ ...prev, [groupKey]: true }));
    scrollToCriterion(missing.id);
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

        <div className="flex-grow min-h-0 flex flex-col">
          <div className="lg:hidden p-2 border-b dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMobilePane('submission')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border ${mobilePane === 'submission' ? 'bg-ave-blue text-white border-ave-blue' : 'bg-white dark:bg-slate-700 text-ave-dark-blue dark:text-slate-100 border-gray-200 dark:border-slate-600'}`}
              >
                Lucrarea
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('scoring')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border ${mobilePane === 'scoring' ? 'bg-ave-blue text-white border-ave-blue' : 'bg-white dark:bg-slate-700 text-ave-dark-blue dark:text-slate-100 border-gray-200 dark:border-slate-600'}`}
              >
                Evaluare{missingCount > 0 && assignment.status !== Status.FINALIZAT ? ` (${missingCount})` : ''}
              </button>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
            <div className={`lg:border-r dark:lg:border-slate-700 flex-col min-h-0 ${mobilePane === 'submission' ? 'flex' : 'hidden'} lg:flex`}>
              <div className="hidden lg:block p-4 border-b dark:border-slate-700 sticky top-0 z-10 bg-white dark:bg-slate-800">
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
          <div className={`flex-col min-h-0 ${mobilePane === 'scoring' ? 'flex' : 'hidden'} lg:flex`}>
            <div className="hidden lg:block p-4 border-b dark:border-slate-700">
              <h4 className="text-base font-bold text-ave-dark-blue dark:text-slate-100">Grilă de evaluare</h4>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {missingCount > 0 && assignment.status !== Status.FINALIZAT && (
                <div className={`rounded-xl px-4 py-3 border ${submitAttempted ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20' : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-700/30'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${submitAttempted ? 'text-red-800 dark:text-red-200' : 'text-gray-700 dark:text-slate-200'}`}>
                      {missingCount} criterii necompletate
                    </p>
                    <button
                      type="button"
                      onClick={handleJumpToNextMissing}
                      className="text-sm font-semibold text-ave-blue hover:underline"
                    >
                      Mergi la următorul
                    </button>
                  </div>
                </div>
              )}

              {([
                { key: 'mare', title: 'Pondere mare' },
                { key: 'medie', title: 'Pondere medie' },
                { key: 'mica', title: 'Pondere mică' },
                { key: 'alte', title: 'Altele' },
              ] as const).map(g => {
                const list = groupedCriteria[g.key];
                if (!list || list.length === 0) return null;

                const subtotal = list.reduce((acc, c) => acc + (scores[c.id] ?? 0), 0);
                const missing = list.filter(c => scores[c.id] === undefined).length;
                const openNow = !!groupOpen[g.key];

                return (
                  <section key={g.key} className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setGroupOpen(prev => ({ ...prev, [g.key]: !prev[g.key] }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 flex items-center justify-between gap-3"
                      aria-expanded={openNow}
                    >
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-ave-dark-blue dark:text-slate-100 truncate">{g.title}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-300">
                          Scor: <span className="font-semibold text-ave-blue">{subtotal}</span>
                          {missing > 0 ? <span className="ml-2 text-red-700 dark:text-red-300">• {missing} necompletate</span> : null}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-500 dark:text-slate-300">{openNow ? '–' : '+'}</span>
                    </button>
                    {openNow && (
                      <div className="p-4 space-y-5">
                        {list.map(c => {
                          const val = scores[c.id];
                          const isMissing = val === undefined;
                          const min = c.scorMin;
                          const max = c.scorMax;
                          const showError = submitAttempted && (isMissing || !!errors[c.id]);
                          const containerClass = showError ? 'border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800';

                          return (
                            <div key={c.id} id={`criterion-${c.id}`} className={`rounded-2xl border ${containerClass} p-4`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 dark:text-slate-100">{c.nume}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{c.descriere || helpersById[c.id]}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-sm font-bold text-ave-blue bg-ave-blue/10 dark:bg-ave-blue/20 px-3 py-1.5 rounded-full">
                                    {val === undefined ? '—' : val}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleClearScore(c.id)}
                                    disabled={assignment.status === Status.FINALIZAT || val === undefined}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-200 disabled:opacity-40"
                                    aria-label={`Șterge scor pentru ${c.nume}`}
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.max(min, (val === undefined ? min : val - 1));
                                    handleScore(c.id, next);
                                    const err = validateCriterion(c, next);
                                    setErrors(prev => ({ ...prev, [c.id]: err }));
                                  }}
                                  disabled={assignment.status === Status.FINALIZAT}
                                  className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-100 font-black text-lg active:scale-95 disabled:opacity-50 touch-manipulation"
                                  aria-label={`Scade scor pentru ${c.nume}`}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  min={min}
                                  max={max}
                                  value={val === undefined ? '' : val}
                                  placeholder="—"
                                  disabled={assignment.status === Status.FINALIZAT}
                                  onChange={e => {
                                    const v = e.target.value;
                                    if (v === '') {
                                      handleClearScore(c.id);
                                      return;
                                    }
                                    const raw = parseInt(v, 10);
                                    if (Number.isNaN(raw)) return;
                                    handleScore(c.id, raw);
                                    const err = validateCriterion(c, raw);
                                    setErrors(prev => ({ ...prev, [c.id]: err }));
                                  }}
                                  onBlur={e => {
                                    const v = e.target.value;
                                    if (v === '') return;
                                    const raw = parseInt(v, 10);
                                    if (Number.isNaN(raw)) return;
                                    const clamped = Math.max(min, Math.min(max, raw));
                                    if (clamped !== raw) handleScore(c.id, clamped);
                                    const err = validateCriterion(c, clamped);
                                    setErrors(prev => ({ ...prev, [c.id]: err }));
                                  }}
                                  className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-center text-2xl font-extrabold text-ave-blue dark:text-slate-100 focus:ring-2 focus:ring-ave-blue focus:border-ave-blue touch-manipulation"
                                  aria-label={`Introdu scor pentru ${c.nume}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.min(max, (val === undefined ? min : val + 1));
                                    handleScore(c.id, next);
                                    const err = validateCriterion(c, next);
                                    setErrors(prev => ({ ...prev, [c.id]: err }));
                                  }}
                                  disabled={assignment.status === Status.FINALIZAT}
                                  className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-100 font-black text-lg active:scale-95 disabled:opacity-50 touch-manipulation"
                                  aria-label={`Crește scor pentru ${c.nume}`}
                                >
                                  +
                                </button>
                              </div>

                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                  Interval permis: {min}–{max}
                                </span>
                                {showError && (
                                  <span className="text-[11px] text-red-600 dark:text-red-400">{errors[c.id] || 'Câmp obligatoriu.'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
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
        </div>
      </div>
    </div>
  );
};

export default CandidateEvaluationModal;
