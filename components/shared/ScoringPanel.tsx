import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Assignment, Candidat, Criterion, Status } from '../../types';
import { InformationCircleIcon, XMarkIcon, UserGroupIcon, ChatBubbleLeftIcon } from './icons';
import Tooltip from './Tooltip';

interface ScoringPanelProps {
    assignment: Assignment;
    candidate: Candidat;
    criteria: Criterion[];
    allAssignments: Assignment[];
    onClose: () => void;
    onSave: (updatedAssignment: Assignment, reason?: string) => void;
    isReadOnly?: boolean;
    isAdmin?: boolean;
}

const ScoringPanel: React.FC<ScoringPanelProps> = ({ assignment, candidate, criteria, allAssignments, onClose, onSave, isReadOnly = false, isAdmin = false }) => {
    const [localScores, setLocalScores] = useState(assignment.scoruri);
    const [localObservations, setLocalObservations] = useState(assignment.observatii);
    const [reason, setReason] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({ mare: true, medie: true, mica: true });
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [isFullHeight, setIsFullHeight] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
    const lastAutoSavedRef = useRef<string>('');

    const hasChanges = useMemo(() => {
        return JSON.stringify(localScores) !== JSON.stringify(assignment.scoruri) ||
               JSON.stringify(localObservations) !== JSON.stringify(assignment.observatii);
    }, [localScores, localObservations, assignment.scoruri, assignment.observatii]);

    const relevantCriteria = criteria.filter(c => c.etapaId === assignment.etapaId && c.categorieId === assignment.categorieId);
    
    const finalScore = useMemo(() => {
        return relevantCriteria.reduce((acc, crit) => {
            const score = localScores[crit.id];
            return acc + (score !== undefined ? score : 0);
        }, 0);
    }, [localScores, relevantCriteria]);

    useEffect(() => {
        setLocalScores(assignment.scoruri);
        setLocalObservations(assignment.observatii);
        setReason('');
        setValidationErrors({});
        setSubmitAttempted(false);
        setIsActionsOpen(false);
        setIsFullHeight(false);
    }, [assignment.id]);

    const handleScoreChange = (criterionId: string, score: number) => {
        setLocalScores(prev => ({ ...prev, [criterionId]: score }));
    };
    
    const handleObservationChange = (criterionId: string, text: string) => {
        setLocalObservations(prev => ({ ...prev, [criterionId]: text }));
    };

    const handleClearScore = (criterionId: string) => {
        setLocalScores(prev => {
            const next = { ...prev };
            delete next[criterionId];
            return next;
        });
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[criterionId];
            return next;
        });
    };

    const validateCriterion = (criterion: Criterion, value: number | undefined) => {
        if (value === undefined) return '';
        if (Number.isNaN(value)) return `Valoarea trebuie între ${criterion.scorMin} și ${criterion.scorMax}.`;
        if (value < criterion.scorMin || value > criterion.scorMax) return `Valoarea trebuie între ${criterion.scorMin} și ${criterion.scorMax}.`;
        return '';
    };

    const missingCount = useMemo(() => {
        return relevantCriteria.filter(c => localScores[c.id] === undefined).length;
    }, [relevantCriteria, localScores]);

    const groupedCriteria = useMemo(() => {
        const groups: Record<string, Criterion[]> = { mare: [], medie: [], mica: [] };
        relevantCriteria.forEach(c => {
            if (c.scorMax >= 8) groups.mare.push(c);
            else if (c.scorMax >= 5) groups.medie.push(c);
            else groups.mica.push(c);
        });
        return groups;
    }, [relevantCriteria]);

    const scrollToCriterion = (criterionId: string) => {
        const el = document.getElementById(`sp-criterion-${criterionId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const jumpToNextMissing = () => {
        const missing = relevantCriteria.find(c => localScores[c.id] === undefined);
        if (!missing) return;
        const groupKey = missing.scorMax >= 8 ? 'mare' : missing.scorMax >= 5 ? 'medie' : 'mica';
        setGroupOpen(prev => ({ ...prev, [groupKey]: true }));
        scrollToCriterion(missing.id);
    };

    const resetAllScores = () => {
        setLocalScores({});
        setValidationErrors({});
        setSubmitAttempted(false);
    };

    useEffect(() => {
        if (isReadOnly || isAdmin) return;
        const payload = JSON.stringify({ id: assignment.id, status: assignment.status, localScores, localObservations, finalScore });
        if (payload === lastAutoSavedRef.current) return;

        setSaveStatus('saving');
        const t = window.setTimeout(() => {
            lastAutoSavedRef.current = payload;
            onSave({
                ...assignment,
                scoruri: localScores,
                observatii: localObservations,
                status: assignment.status === Status.NEINCEPUT ? Status.IN_CURS : assignment.status,
                scorFinal: finalScore,
                lastModified: new Date(),
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 900);

        return () => window.clearTimeout(t);
    }, [assignment, finalScore, isAdmin, isReadOnly, localObservations, localScores, onSave]);
    
    const handleSave = (newStatus: Status) => {
        setSubmitAttempted(true);
        const nextErrors: Record<string, string> = {};
        relevantCriteria.forEach(c => {
            const val = localScores[c.id];
            const err = validateCriterion(c, val);
            if (err) nextErrors[c.id] = err;
            if (newStatus === Status.FINALIZAT && val === undefined) nextErrors[c.id] = 'Câmp obligatoriu.';
        });
        setValidationErrors(nextErrors);

        if (newStatus === Status.FINALIZAT) {
            const firstMissing = relevantCriteria.find(c => localScores[c.id] === undefined);
            const firstError = relevantCriteria.find(c => nextErrors[c.id]);
            const firstIssue = firstMissing || firstError;
            if (firstIssue) {
                const groupKey = firstIssue.scorMax >= 8 ? 'mare' : firstIssue.scorMax >= 5 ? 'medie' : 'mica';
                setGroupOpen(prev => ({ ...prev, [groupKey]: true }));
                scrollToCriterion(firstIssue.id);
                return;
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            alert("Vă rugăm să corectați erorile înainte de a salva.");
            return;
        }

        if (isAdmin && hasChanges && !reason.trim()) {
            alert('Vă rugăm să oferiți un motiv pentru modificarea scorurilor.');
            return;
        }

        const updatedAssignment = { 
            ...assignment, 
            scoruri: localScores,
            observatii: localObservations, 
            status: isAdmin ? assignment.status : newStatus, // Admin doesn't change status, just scores
            scorFinal: finalScore,
            lastModified: new Date() 
        };

        onSave(updatedAssignment, reason);
        
        if (!isAdmin && newStatus === Status.FINALIZAT) {
            onClose();
        } else if (isAdmin) {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end sm:justify-center overflow-hidden" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="scoring-panel-title">
            <div 
                className={`w-full max-w-full sm:max-w-2xl ${isFullHeight ? 'h-[98dvh] max-h-[98dvh] rounded-none sm:rounded-lg' : 'max-h-[90vh] rounded-t-3xl sm:rounded-lg'} bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-slide-up sm:animate-none overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative p-3 sm:px-6 sm:py-4 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex-shrink-0">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full sm:hidden"></div>
                    <div className="flex justify-between items-center w-full pt-3 sm:pt-0">
                        <div className="min-w-0 flex-1">
                            <h3 id="scoring-panel-title" className="text-lg sm:text-2xl font-bold text-ave-dark-blue dark:text-slate-100 truncate">{candidate.nume}</h3>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 truncate">{candidate.scoala}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {!isReadOnly && !isAdmin && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsActionsOpen(v => !v)}
                                        aria-haspopup="menu"
                                        aria-expanded={isActionsOpen}
                                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-slate-700 text-ave-dark-blue dark:text-slate-100"
                                    >
                                        Acțiuni
                                    </button>
                                    {isActionsOpen && (
                                        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-20">
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => { setIsActionsOpen(false); jumpToNextMissing(); }}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100"
                                            >
                                                Sari la următorul criteriu necompletat
                                            </button>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => { setIsActionsOpen(false); setIsFullHeight(v => !v); }}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100"
                                            >
                                                {isFullHeight ? 'Închide ecran complet' : 'Ecran complet'}
                                            </button>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => { setIsActionsOpen(false); setIsCompact(v => !v); }}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100"
                                            >
                                                {isCompact ? 'Mod extins' : 'Mod compact'}
                                            </button>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => { setIsActionsOpen(false); resetAllScores(); }}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-red-700 dark:text-red-300"
                                            >
                                                Resetează toate scorurile
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button onClick={onClose} className="p-3 -m-3 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100">
                                <span className="sr-only">Închide</span>
                                <XMarkIcon className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-4 sm:space-y-6 overscroll-contain w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {!isReadOnly && !isAdmin && missingCount > 0 && (
                        <div className={`rounded-xl px-4 py-3 border ${submitAttempted ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20' : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-700/30'}`}>
                            <div className="flex items-center justify-between gap-3">
                                <p className={`text-sm font-semibold ${submitAttempted ? 'text-red-800 dark:text-red-200' : 'text-gray-700 dark:text-slate-200'}`}>
                                    {missingCount} criterii necompletate
                                </p>
                                <button
                                    type="button"
                                    onClick={jumpToNextMissing}
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
                    ] as const).map(g => {
                        const list = groupedCriteria[g.key];
                        if (!list || list.length === 0) return null;

                        const subtotal = list.reduce((acc, c) => acc + (localScores[c.id] ?? 0), 0);
                        const missing = list.filter(c => localScores[c.id] === undefined).length;
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
                                        {list.map(criterion => {
                                            const val = localScores[criterion.id];
                                            const isMissing = val === undefined;
                                            const min = criterion.scorMin;
                                            const max = criterion.scorMax;
                                            const showError = submitAttempted && (isMissing || !!validationErrors[criterion.id]);
                                            const containerClass = showError ? 'border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800';

                                            return (
                                                <div key={criterion.id} id={`sp-criterion-${criterion.id}`} className={`rounded-2xl border ${containerClass} p-4`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 dark:text-slate-100">{criterion.nume}</p>
                                                            {!isCompact && (
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{criterion.descriere}</p>
                                                            )}
                                                            {isAdmin && (
                                                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                                    <Tooltip content="Acesta este scorul mediu acordat de alți jurați care au finalizat evaluarea pentru acest candidat, pentru același criteriu. Este afișat doar în scop informativ.">
                                                                        <InformationCircleIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 cursor-help ml-2" />
                                                                    </Tooltip>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-sm font-bold text-ave-blue bg-ave-blue/10 dark:bg-ave-blue/20 px-3 py-1.5 rounded-full">
                                                                {val === undefined ? '—' : val}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleClearScore(criterion.id)}
                                                                disabled={isReadOnly || val === undefined}
                                                                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-200 disabled:opacity-40"
                                                                aria-label={`Șterge scor pentru ${criterion.nume}`}
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
                                                                handleScoreChange(criterion.id, next);
                                                                const err = validateCriterion(criterion, next);
                                                                setValidationErrors(prev => {
                                                                    const updated = { ...prev };
                                                                    if (err) updated[criterion.id] = err;
                                                                    else delete updated[criterion.id];
                                                                    return updated;
                                                                });
                                                            }}
                                                            disabled={isReadOnly}
                                                            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-100 font-black text-lg active:scale-95 disabled:opacity-50 touch-manipulation"
                                                            aria-label={`Scade scor pentru ${criterion.nume}`}
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
                                                            disabled={isReadOnly}
                                                            onChange={e => {
                                                                const v = e.target.value;
                                                                if (v === '') {
                                                                    handleClearScore(criterion.id);
                                                                    return;
                                                                }
                                                                const raw = parseInt(v, 10);
                                                                if (Number.isNaN(raw)) return;
                                                                handleScoreChange(criterion.id, raw);
                                                                const err = validateCriterion(criterion, raw);
                                                                setValidationErrors(prev => {
                                                                    const next = { ...prev };
                                                                    if (err) next[criterion.id] = err;
                                                                    else delete next[criterion.id];
                                                                    return next;
                                                                });
                                                            }}
                                                            onBlur={e => {
                                                                const v = e.target.value;
                                                                if (v === '') return;
                                                                const raw = parseInt(v, 10);
                                                                if (Number.isNaN(raw)) return;
                                                                const clamped = Math.max(min, Math.min(max, raw));
                                                                if (clamped !== raw) handleScoreChange(criterion.id, clamped);
                                                                const err = validateCriterion(criterion, clamped);
                                                                setValidationErrors(prev => {
                                                                    const next = { ...prev };
                                                                    if (err) next[criterion.id] = err;
                                                                    else delete next[criterion.id];
                                                                    return next;
                                                                });
                                                            }}
                                                            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-center text-2xl font-extrabold text-ave-blue dark:text-slate-100 focus:ring-2 focus:ring-ave-blue focus:border-ave-blue touch-manipulation"
                                                            aria-label={`Introdu scor pentru ${criterion.nume}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = Math.min(max, (val === undefined ? min : val + 1));
                                                                handleScoreChange(criterion.id, next);
                                                                const err = validateCriterion(criterion, next);
                                                                setValidationErrors(prev => {
                                                                    const updated = { ...prev };
                                                                    if (err) updated[criterion.id] = err;
                                                                    else delete updated[criterion.id];
                                                                    return updated;
                                                                });
                                                            }}
                                                            disabled={isReadOnly}
                                                            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-100 font-black text-lg active:scale-95 disabled:opacity-50 touch-manipulation"
                                                            aria-label={`Crește scor pentru ${criterion.nume}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                                            Interval permis: {min}–{max}
                                                        </span>
                                                        {showError && (
                                                            <span className="text-[11px] text-red-600 dark:text-red-400">{validationErrors[criterion.id] || 'Câmp obligatoriu.'}</span>
                                                        )}
                                                    </div>

                                                    <div className="relative w-full mt-4">
                                                        <ChatBubbleLeftIcon className="absolute left-4 top-4 text-gray-400 dark:text-slate-400 w-6 h-6"/>
                                                        <textarea
                                                            rows={3}
                                                            placeholder="Adaugă observații..."
                                                            value={localObservations[criterion.id] || ''}
                                                            onChange={e => handleObservationChange(criterion.id, e.target.value)}
                                                            disabled={isReadOnly}
                                                            className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 disabled:opacity-50 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
                 <footer className="p-4 sm:p-5 border-t dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 z-10 flex flex-col gap-4 flex-shrink-0 w-full overflow-x-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Progres: {relevantCriteria.length - missingCount}/{relevantCriteria.length}</span>
                                {saveStatus === 'saving' && <span className="text-xs text-blue-500 font-semibold animate-pulse ml-2">Se salvează...</span>}
                                {saveStatus === 'saved' && <span className="text-xs text-green-500 font-semibold ml-2">Salvat automat</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base text-gray-600 dark:text-slate-400 flex-shrink-0">Scor Final:</span>
                                <p className="text-2xl sm:text-4xl font-extrabold text-ave-blue flex-shrink-0">{finalScore.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-ave-blue h-full rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${((relevantCriteria.length - missingCount) / relevantCriteria.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    {isReadOnly ? (
                         <p className="text-base font-semibold text-center text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 px-4 py-3 rounded-xl">Evaluare Finalizată</p>
                    ) : isAdmin ? (
                        <div className="flex flex-col gap-3 w-full">
                            <input
                                type="text"
                                placeholder="Motivul modificării (obligatoriu)"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                            />
                             <button 
                                onClick={() => handleSave(assignment.status)} 
                                className="w-full py-4 rounded-xl text-base font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue active:bg-ave-dark-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                disabled={hasChanges && !reason.trim()}>
                                Salvează Modificări
                             </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <button 
                                onClick={() => handleSave(Status.IN_CURS)} 
                                className="flex-1 py-4 rounded-xl text-base font-semibold border-2 border-gray-300 hover:bg-gray-100 active:bg-gray-200 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                disabled={Object.keys(validationErrors).length > 0}>
                                Salvează Progres
                            </button>
                            <button 
                                onClick={() => handleSave(Status.FINALIZAT)} 
                                className="flex-1 py-4 rounded-xl text-base font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue active:bg-ave-dark-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                disabled={Object.keys(validationErrors).length > 0}>
                                Trimite Final
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ScoringPanel;
