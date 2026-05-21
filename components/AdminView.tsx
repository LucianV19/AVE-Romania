import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Candidat, Jurat, Assignment, AuditLog, Stage, Category, Criterion, Status, Admin, Regiune, UserRole, View } from '../types';
import { FormData as DirectorFormData } from '../formular/types';
import Card from './shared/Card';
import { PlusIcon, TrashIcon, PencilSquareIcon, DownloadIcon, ClipboardDocumentCheckIcon, SearchIcon, ChatBubbleLeftIcon, InformationCircleIcon, AlertTriangleIcon, TableIcon, UserGroupIcon, DocumentDuplicateIcon, ClockIcon, CheckBadgeIcon, ChevronRightIcon, GridIcon } from './shared/icons';
import { ADMINI } from '../constants';
import Tooltip from './shared/Tooltip';
import ScoringPanel from './shared/ScoringPanel';
import Dashboard from './Dashboard';
import { getRegions, saveRegions, resetRegions } from '../utils/regions';
import HomeButton from './shared/HomeButton';
import { useNotifications } from './contexts/NotificationContext';

// Helper hook for debouncing input to improve performance on large lists
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const RegionsManager: React.FC<{
    candidates: Candidat[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidat[]>>;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
    currentUser: Admin;
}> = ({ candidates, setCandidates, addAuditLog, currentUser }) => {
    const { notify } = useNotifications();
    const [regions, setRegions] = React.useState<string[]>(() => getRegions());
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [editingValue, setEditingValue] = React.useState('');
    const [newRegion, setNewRegion] = React.useState('');

    const handleSave = () => {
        saveRegions(regions);
        addAuditLog({ adminId: currentUser.id, actiune: 'Actualizare Regiuni', detalii: { modificare: 'Regiuni actualizate' , motiv: 'Regiuni modificate din interfața de administrare.' } });
        notify('Regiuni', 'Regiunile au fost salvate.', 'success');
    };

    const handleAdd = () => {
        const val = newRegion.trim();
        if (!val) return;
        setRegions(prev => {
            const next = [...prev, val];
            saveRegions(next);
            return next;
        });
        setNewRegion('');
    };

    const startEdit = (idx: number) => {
        setEditingIndex(idx);
        setEditingValue(regions[idx]);
    };

    const confirmEdit = (idx: number) => {
        const old = regions[idx];
        const updated = regions.map((r, i) => i === idx ? editingValue.trim() : r);
        setRegions(updated);
        saveRegions(updated);
        // update candidates which referenced old region
        setCandidates(prev => prev.map(c => ({ ...c, regiune: (c.regiune === old ? (editingValue.trim() as any) : c.regiune) })));
        addAuditLog({ adminId: currentUser.id, actiune: 'Schimbare Regiune', detalii: { modificare: `"${old}" -> "${editingValue.trim()}"`, motiv: ' redenumire regiune' } });
        setEditingIndex(null);
        setEditingValue('');
    };

    const handleDelete = (idx: number) => {
        const removed = regions[idx];
        if (!confirm(`Ștergeți regiunea "${removed}"? Această acțiune nu va șterge candidații, dar le va lăsa regiunea neschimbată.`)) return;
        const updated = regions.filter((_, i) => i !== idx);
        setRegions(updated);
        saveRegions(updated);
        addAuditLog({ adminId: currentUser.id, actiune: 'Ștergere Regiune', detalii: { modificare: removed, motiv: 'Regiune ștearsă din setări' } });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="space-y-2">
                {regions.map((r, idx) => (
                    <div key={r} className="flex items-center justify-between gap-2">
                        {editingIndex === idx ? (
                            <input value={editingValue} onChange={e => setEditingValue(e.target.value)} className="flex-1 px-3 py-2 rounded-md border" />
                        ) : (
                            <div className="text-sm text-gray-800 dark:text-slate-200 flex-1">{r}</div>
                        )}
                        <div className="flex items-center gap-2">
                            {editingIndex === idx ? (
                                <>
                                    <button onClick={() => confirmEdit(idx)} className="px-2 py-1 bg-green-500 text-white rounded-md text-xs">Salvează</button>
                                    <button onClick={() => { setEditingIndex(null); setEditingValue(''); }} className="px-2 py-1 bg-gray-200 rounded-md text-xs">Anulează</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(idx)} className="px-2 py-1 bg-ave-blue text-white rounded-md text-xs">Editează</button>
                                    <button onClick={() => handleDelete(idx)} className="px-2 py-1 bg-red-500 text-white rounded-md text-xs">Șterge</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input placeholder="Adaugă regiune nouă" value={newRegion} onChange={e => setNewRegion(e.target.value)} className="flex-1 px-3 py-2 rounded-md border" />
                <button onClick={handleAdd} className="px-3 py-2 bg-ave-blue text-white rounded-md">Adaugă</button>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => { resetRegions(); const def = getRegions(); setRegions(def); notify('Regiuni', 'Regiunile au fost resetate la valorile implicite.', 'info'); }} className="px-3 py-1 text-sm rounded-md bg-gray-100">Reset</button>
                <button onClick={handleSave} className="px-3 py-1 text-sm rounded-md bg-ave-blue text-white">Salvează</button>
            </div>
        </div>
    );
};


type AdminViewProps = {
    candidates: Candidat[];
    judges: Jurat[];
    assignments: Assignment[];
    stages: Stage[];
    categories: Category[];
    criteria: Criterion[];
    auditLogs: AuditLog[];
    currentUser: Admin;
    setCandidates: React.Dispatch<React.SetStateAction<Candidat[]>>;
    setJudges: React.Dispatch<React.SetStateAction<Jurat[]>>;
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
    setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    setCriteria: React.Dispatch<React.SetStateAction<Criterion[]>>;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
    isAnonymized: boolean;
    setIsAnonymized: (value: boolean) => void;
    onNavigate?: (view: View) => void;
};

type AdminTab = 'dashboard' | 'config' | 'assignments' | 'audit' | 'jury';

type EditingItem =
  | { type: 'stage'; data: Stage | { nume: string; activ: boolean } }
  | { type: 'category'; data: Category | { nume: string } }
  | { type: 'criterion'; data: Criterion | { nume: string; descriere: string; scorMin: number; scorMax: number } };

type DeletingItem = {
    type: 'stage' | 'category' | 'criterion' | 'candidate' | 'jurat';
    id: string;
    name: string;
};

interface ConfigManagementProps extends AdminViewProps {
    activeSubTab: 'structure' | 'candidates' | 'judges';
    setActiveSubTab: (subTab: 'structure' | 'candidates' | 'judges') => void;
    judgeSearch: string;
    setJudgeSearch: (search: string) => void;
    candidateCategoryFilter: string;
    setCandidateCategoryFilter: (category: string) => void;
}

const ConfigManagement: React.FC<ConfigManagementProps> = (props) => {
    const { stages, setStages, categories, setCategories, criteria, setCriteria, candidates, setCandidates, assignments, setAssignments, addAuditLog, currentUser, judges, setJudges, isAnonymized, setIsAnonymized, activeSubTab, setActiveSubTab, judgeSearch, setJudgeSearch, candidateCategoryFilter, setCandidateCategoryFilter } = props;
    const [candidateViewMode, setCandidateViewMode] = useState<'table' | 'grid'>('table');
    const [judgeViewMode, setJudgeViewMode] = useState<'table' | 'grid'>('grid');
    const [selectedStage, setSelectedStage] = useState<string | null>(stages.find(s=>s.activ)?.id || stages[0]?.id || null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]?.id || null);
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [editingCandidate, setEditingCandidate] = useState<Partial<Candidat> | null>(null);
    const [editingJurat, setEditingJurat] = useState<Partial<Jurat> | null>(null);
    const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);
    const [configDeadline, setConfigDeadline] = useState<string>('');
    const [candidateSearch, setCandidateSearch] = useState('');
    const [candidateStatusFilter, setCandidateStatusFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
    const [candidateRegionFilter, setCandidateRegionFilter] = useState<string>('all');
    const [candidateCategoryFilterState, setCandidateCategoryFilterState] = useState<string>('all');
    
    // Sync local state with prop if provided, or use local
    useEffect(() => {
        if (props.candidateCategoryFilter) {
            setCandidateCategoryFilterState(props.candidateCategoryFilter);
        }
    }, [props.candidateCategoryFilter]);

    // Use either the prop setter or local setter
    const handleSetCategoryFilter = (val: string) => {
        setCandidateCategoryFilterState(val);
        if (props.setCandidateCategoryFilter) {
             props.setCandidateCategoryFilter(val);
        }
    };
    
    // Determine the effective filter value to use
    const activeCategoryFilter = props.candidateCategoryFilter !== undefined ? props.candidateCategoryFilter : candidateCategoryFilterState;
    const [candidatePage, setCandidatePage] = useState(1);
    const candidatesPerPage = 10;
    const [judgePage, setJudgePage] = useState(1);
    const judgesPerPage = 10;

    const debouncedCandidateSearch = useDebounce(candidateSearch, 300);
    const debouncedJudgeSearch = useDebounce(judgeSearch, 300);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch = c.nume.toLowerCase().includes(debouncedCandidateSearch.toLowerCase()) || 
                c.scoala.toLowerCase().includes(debouncedCandidateSearch.toLowerCase());
            
            const isComplete = !!c.extendedData?.acordRegulament; // Basic check for completion
            const matchesStatus = candidateStatusFilter === 'all' 
                ? true 
                : candidateStatusFilter === 'complete' 
                    ? isComplete 
                    : !isComplete;

            const matchesRegion = candidateRegionFilter === 'all' 
                ? true 
                : c.regiune === candidateRegionFilter;

            const matchesCategory = activeCategoryFilter === 'all'
                ? true
                : c.categorieIds.includes(activeCategoryFilter);

            return matchesSearch && matchesStatus && matchesRegion && matchesCategory;
        });
    }, [candidates, debouncedCandidateSearch, candidateStatusFilter, candidateRegionFilter, activeCategoryFilter]);

    const paginatedCandidates = useMemo(() => {
        const start = (candidatePage - 1) * candidatesPerPage;
        return filteredCandidates.slice(start, start + candidatesPerPage);
    }, [filteredCandidates, candidatePage]);

    const filteredJudges = useMemo(() => {
        return judges.filter(j => 
            j.nume.toLowerCase().includes(debouncedJudgeSearch.toLowerCase())
        );
    }, [judges, debouncedJudgeSearch]);

    const paginatedJudges = useMemo(() => {
        const start = (judgePage - 1) * judgesPerPage;
        return filteredJudges.slice(start, start + judgesPerPage);
    }, [filteredJudges, judgePage]);

    useEffect(() => { setCandidatePage(1); }, [debouncedCandidateSearch]);
    useEffect(() => { setJudgePage(1); }, [debouncedJudgeSearch]);

    useEffect(() => {
        const saved = localStorage.getItem('gala_deadline_config');
        if (saved) {
            // Convert to datetime-local format: YYYY-MM-DDThh:mm
            const d = new Date(saved);
            const pad = (n: number) => String(n).padStart(2, '0');
            const fmt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            setConfigDeadline(fmt);
        }
    }, []);

    const handleSaveDeadline = () => {
        if (!configDeadline) return;
        const date = new Date(configDeadline);
        localStorage.setItem('gala_deadline_config', date.toISOString());
        alert('Termenul limită a fost actualizat cu succes!');
    };

    const handleExportJudges = () => {
        const headers = ['ID', 'Nume', 'Email', 'Telefon', 'Profesie', 'Organizatie', 'LinkedIn', 'Facebook', 'Instagram', 'Motivatie'];
        const csvRows = [headers.join(',')];

        judges.forEach(j => {
             const escape = (val: string | number | undefined) => {
                 if (!val) return '';
                 const s = String(val);
                 if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
                 return s;
             };
             
             const row = [
                 escape(j.id),
                 escape(j.nume),
                 escape(j.email),
                 escape(j.telefon),
                 escape(j.profesie),
                 escape(j.organizatie),
                 escape(j.linkedin_url),
                 escape(j.facebook_url),
                 escape(j.instagram_url),
                 escape(j.motivatie)
             ];
             csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "lista-jurati.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const relevantCriteria = useMemo(() => {
        if (!selectedStage || !selectedCategory) return [];
        return criteria.filter(c => c.etapaId === selectedStage && c.categorieId === selectedCategory);
    }, [criteria, selectedStage, selectedCategory]);

    const handleToggleStage = (stageId: string) => {
        setStages(prevStages => {
            return prevStages.map(s => s.id === stageId ? { ...s, activ: !s.activ } : s);
        });
    };

    const handleSetCurrentStage = (stageId: string) => {
        setStages(prevStages => {
            return prevStages.map(s => ({ ...s, isCurrent: s.id === stageId }));
        });
    };

    const initiateDelete = (type: DeletingItem['type'], id: string, name: string) => {
        setDeletingItem({ type, id, name });
    };

    const confirmDelete = () => {
        if (!deletingItem) return;

        const { type, id, name } = deletingItem;

        if (type === 'stage') {
            setStages(prev => prev.filter(s => s.id !== id));
            setCriteria(prev => prev.filter(c => c.etapaId !== id)); // Cascade delete
            setAssignments(prev => prev.filter(a => a.etapaId !== id)); // Cascade delete
        }
        if (type === 'category') {
            setCategories(prev => prev.filter(c => c.id !== id));
            setCriteria(prev => prev.filter(c => c.categorieId !== id)); // Cascade delete
        }
        if (type === 'criterion') setCriteria(prev => prev.filter(c => c.id !== id));
        if (type === 'candidate') {
            setCandidates(prev => prev.filter(c => c.id !== id));
            setAssignments(prev => prev.filter(a => a.candidatId !== id)); // Cascade delete assignments
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Ștergere Candidat',
                detalii: {
                    candidatId: id,
                    numeCandidat: name,
                    motiv: `Candidatul "${name}" a fost șters din sistem.`
                }
            });
        }
        if (type === 'jurat') {
            const juratName = judges.find(j => j.id === id)?.nume || 'N/A';
            setJudges(prev => prev.filter(j => j.id !== id));
            setAssignments(prev => prev.filter(a => a.juratId !== id)); // Cascade delete assignments
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Ștergere Jurat',
                detalii: {
                    juratId: id,
                    numeJurat: juratName,
                    motiv: `Juratul "${juratName}" a fost șters din sistem.`
                }
            });
        }
        setDeletingItem(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
                <button onClick={() => setActiveSubTab('structure')} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeSubTab === 'structure' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}>Structură & Setări</button>
                <button onClick={() => setActiveSubTab('candidates')} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeSubTab === 'candidates' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}>Candidați ({candidates.length})</button>
                <button onClick={() => setActiveSubTab('judges')} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeSubTab === 'judges' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}>Jurați ({judges.length})</button>
            </div>

            {activeSubTab === 'structure' && (
                <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-ave-blue">Setări Globale</h3>
                    </div>
                    <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-600 pb-4">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-slate-200">Anonimizare Jurați</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Ascunde numele și școala candidaților în portalul de jurizare.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isAnonymized} onChange={(e) => setIsAnonymized(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ave-blue"></div>
                            </label>
                        </div>

                        <div className="pt-2">
                             <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold text-gray-800 dark:text-slate-200">Termen Limită Înscrieri</p>
                                <button 
                                    onClick={handleSaveDeadline}
                                    className="text-xs px-3 py-1 bg-ave-blue text-white rounded hover:bg-ave-dark-blue transition-colors"
                                >
                                    Salvează Data
                                </button>
                             </div>
                             <input 
                                type="datetime-local" 
                                value={configDeadline}
                                onChange={e => setConfigDeadline(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 shadow-sm focus:border-ave-blue focus:ring-ave-blue text-sm"
                            />
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Acest termen va fi afișat în formularul de înscriere.</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-ave-blue">Regiuni</h3>
                    </div>
                    <RegionsManager candidates={candidates} setCandidates={setCandidates} addAuditLog={addAuditLog} currentUser={currentUser} />
                </Card>
                {/* Candidates moved to tab */}
                {/* Judges moved to tab */}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-ave-blue">Etape</h3>
                        <button onClick={() => setEditingItem({ type: 'stage', data: { nume: '', activ: true } })} className="flex items-center space-x-1 text-sm font-semibold text-ave-blue hover:text-ave-dark-blue dark:hover:text-blue-400"><PlusIcon className="w-4 h-4" /><span>Adaugă</span></button>
                    </div>
                    <ul className="space-y-2 overflow-y-auto flex-grow">
                        {stages.map(s => (
                            <li key={s.id} onClick={() => setSelectedStage(s.id)} className={`text-sm p-2 rounded flex justify-between items-center cursor-pointer transition-all ${selectedStage === s.id ? 'bg-blue-100 dark:bg-ave-blue/30 font-semibold text-ave-blue dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700'} ${!s.activ ? 'opacity-60' : ''}`}>
                                <span className={`${!s.activ ? 'text-gray-400 dark:text-slate-500' : ''}`}>{s.nume}</span>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSetCurrentStage(s.id); }}
                                        className={`p-1 rounded-full transition-colors ${s.isCurrent ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                        title={s.isCurrent ? 'Etapa curentă' : 'Setează ca etapă curentă'}
                                    >
                                        <CheckBadgeIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStage(s.id); }}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ave-blue focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${s.activ ? 'bg-ave-blue' : 'bg-gray-200 dark:bg-slate-600'}`}
                                        role="switch"
                                        aria-checked={s.activ}
                                        title={s.activ ? 'Dezactivează etapa' : 'Activează etapa'}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${s.activ ? 'translate-x-5' : 'translate-x-0'}`}/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'stage', data: s }); }} className="text-gray-500 dark:text-slate-400 hover:text-ave-blue p-1 -m-1" title="Editează"><PencilSquareIcon className="w-4 h-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); initiateDelete('stage', s.id, s.nume); }} className="text-gray-500 dark:text-slate-400 hover:text-red-500 p-1 -m-1" title="Șterge"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-ave-blue">Categorii</h3>
                        <button onClick={() => setEditingItem({ type: 'category', data: { nume: '' } })} className="flex items-center space-x-1 text-sm font-semibold text-ave-blue hover:text-ave-dark-blue dark:hover:text-blue-400"><PlusIcon className="w-4 h-4" /><span>Adaugă</span></button>
                    </div>
                    <ul className="space-y-2 overflow-y-auto flex-grow">
                        {categories.map(c => (
                            <li key={c.id} onClick={() => setSelectedCategory(c.id)} className={`text-sm p-2 rounded flex justify-between items-center cursor-pointer transition-colors ${selectedCategory === c.id ? 'bg-blue-100 dark:bg-ave-blue/30 font-semibold text-ave-blue dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                <span>{c.nume}</span>
                                <div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'category', data: c }); }} className="text-gray-500 dark:text-slate-400 hover:text-ave-blue p-1 -m-1" title="Editează"><PencilSquareIcon className="w-4 h-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); initiateDelete('category', c.id, c.nume); }} className="text-gray-500 dark:text-slate-400 hover:text-red-500 p-1 -m-1" title="Șterge"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-ave-blue">Criterii Evaluare</h3>
                        <button onClick={() => setEditingItem({ type: 'criterion', data: { nume: '', descriere: '', scorMin: 1, scorMax: 100 } })} disabled={!selectedStage || !selectedCategory} className="flex items-center space-x-1 text-sm font-semibold text-ave-blue hover:text-ave-dark-blue disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-blue-400"><PlusIcon className="w-4 h-4" /><span>Adaugă</span></button>
                    </div>
                    {!selectedStage || !selectedCategory ? (
                        <div className="flex-grow flex items-center justify-center text-center text-sm text-gray-500 dark:text-slate-400">
                            <p>Selectați o etapă și o categorie pentru a vedea criteriile.</p>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col">
                            {relevantCriteria.length > 0 ? (
                                <ul className="space-y-2 overflow-y-auto flex-grow">
                                    {relevantCriteria.map(c => (
                                        <li key={c.id} className="text-sm p-2 bg-ave-blue/5 dark:bg-ave-blue/10 rounded flex justify-between items-center ring-1 ring-ave-blue/20 dark:ring-ave-blue/40 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span>{c.nume}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => setEditingItem({ type: 'criterion', data: c })} className="text-gray-500 dark:text-slate-400 hover:text-ave-blue p-1 -m-1" title="Editează"><PencilSquareIcon className="w-4 h-4"/></button>
                                                <button onClick={() => initiateDelete('criterion', c.id, c.nume)} className="text-gray-500 dark:text-slate-400 hover:text-red-500 p-1 -m-1" title="Șterge"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex-grow flex items-center justify-center text-center text-sm text-gray-500 dark:text-slate-400">
                                    <p>Niciun criteriu definit. <br/>Apasă 'Adaugă' pentru a crea unul.</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
            </>
            )}

            {activeSubTab === 'candidates' && (
                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-ave-blue">Management Candidați</h3>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                            <select
                                value={activeCategoryFilter}
                                onChange={(e) => handleSetCategoryFilter(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="all">Toate Categoriile</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nume}</option>
                                ))}
                            </select>
                            <select
                                value={candidateRegionFilter}
                                onChange={(e) => setCandidateRegionFilter(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="all">Toate Regiunile</option>
                                {getRegions().map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <select
                                value={candidateStatusFilter}
                                onChange={(e) => setCandidateStatusFilter(e.target.value as any)}
                                className="w-full sm:w-auto px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="all">Toate Statusurile</option>
                                <option value="complete">Complet</option>
                                <option value="incomplete">Incomplet</option>
                            </select>
                            <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Caută candidat..."
                                    value={candidateSearch}
                                    onChange={(e) => setCandidateSearch(e.target.value)}
                                    className="pl-8 pr-4 py-2 border rounded-md text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                <SearchIcon className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" />
                            </div>
                            <button onClick={() => setEditingCandidate({ categorieIds: [] })} className="flex items-center space-x-1 px-4 py-2 bg-ave-blue text-white rounded-md text-sm font-semibold hover:bg-ave-dark-blue whitespace-nowrap"><PlusIcon className="w-4 h-4" /><span>Adaugă</span></button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-4 py-3">Candidat</th>
                                    <th className="px-4 py-3">Școală</th>
                                    <th className="px-4 py-3">Regiune</th>
                                    <th className="px-4 py-3">Localitate</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Categorii</th>
                                    <th className="px-4 py-3 text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {paginatedCandidates.length > 0 ? (
                                    paginatedCandidates.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 flex items-center space-x-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-slate-100">{c.nume}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">{c.id}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.scoala}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.regiune}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.extendedData?.localitateUnitate || '-'}</td>
                                            <td className="px-4 py-3">
                                                {c.extendedData?.acordRegulament ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">Complet</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded text-xs">Incomplet</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {c.categorieIds.map(catId => (
                                                        <span key={catId} className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                                                            {categories.find(cat => cat.id === catId)?.nume || 'N/A'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => setEditingCandidate(c)} className="text-gray-500 hover:text-ave-blue dark:text-slate-400" title="Editează"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => initiateDelete('candidate', c.id, c.nume)} className="text-gray-500 hover:text-red-500 dark:text-slate-400" title="Șterge"><TrashIcon className="w-5 h-5"/></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                            Nu am găsit candidați care să corespundă criteriilor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredCandidates.length > candidatesPerPage && (
                         <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-slate-700">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Afișare {Math.min((candidatePage - 1) * candidatesPerPage + 1, filteredCandidates.length)} - {Math.min(candidatePage * candidatesPerPage, filteredCandidates.length)} din {filteredCandidates.length}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCandidatePage(p => Math.max(1, p - 1))}
                                    disabled={candidatePage === 1}
                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                                >
                                    Anterior
                                </button>
                                <button 
                                    onClick={() => setCandidatePage(p => Math.min(Math.ceil(filteredCandidates.length / candidatesPerPage), p + 1))}
                                    disabled={candidatePage >= Math.ceil(filteredCandidates.length / candidatesPerPage)}
                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                                >
                                    Următor
                                </button>
                            </div>
                         </div>
                    )}
                </Card>
            )}

            {activeSubTab === 'judges' && (
                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                         <h3 className="text-lg font-bold text-ave-blue">Management Jurați</h3>
                         <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <div className="relative flex-grow sm:flex-grow-0">
                                <input
                                    type="text"
                                    placeholder="Caută jurat..."
                                    value={judgeSearch}
                                    onChange={(e) => setJudgeSearch(e.target.value)}
                                    className="pl-8 pr-4 py-2 border rounded-md text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                <SearchIcon className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" />
                            </div>
                            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                                <button
                                    onClick={() => setJudgeViewMode('table')}
                                    className={`p-1.5 rounded-md transition-all ${judgeViewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow text-ave-blue dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                                    title="Vizualizare Tabel"
                                >
                                    <TableIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setJudgeViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${judgeViewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow text-ave-blue dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                                    title="Vizualizare Grid"
                                >
                                    <GridIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <button onClick={handleExportJudges} className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 whitespace-nowrap"><DownloadIcon className="w-4 h-4" /><span>Export CSV</span></button>
                            <button onClick={() => setEditingJurat({})} className="flex items-center space-x-1 px-4 py-2 bg-ave-blue text-white rounded-md text-sm font-semibold hover:bg-ave-dark-blue whitespace-nowrap"><PlusIcon className="w-4 h-4" /><span>Adaugă</span></button>
                        </div>
                    </div>

                    {judgeViewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Jurat</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Profesie</th>
                                        <th className="px-4 py-3">Evaluări</th>
                                        <th className="px-4 py-3 text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {paginatedJudges.length > 0 ? (
                                        paginatedJudges.map(j => {
                                            const count = assignments.filter(a => a.juratId === j.id).length;
                                            return (
                                                <tr 
                                                    key={j.id} 
                                                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                                    onClick={() => setEditingJurat(j)}
                                                >
                                                    <td className="px-4 py-3 flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-ave-blue/20 text-ave-blue flex items-center justify-center font-bold text-xs">
                                                            {j.nume.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-slate-100">{j.nume}</p>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400">{j.id}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                                                        <div className="flex flex-col text-xs">
                                                            <span>{j.email}</span>
                                                            <span className="text-gray-500">{j.telefon}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                                                        <div className="flex flex-col text-xs">
                                                            <span className="font-medium">{j.profesie}</span>
                                                            <span className="text-gray-500">{j.organizatie}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 rounded text-xs font-bold">
                                                            {count}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-2">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingJurat(j); }} className="text-gray-500 hover:text-ave-blue dark:text-slate-400" title="Editează"><PencilSquareIcon className="w-5 h-5"/></button>
                                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete('jurat', j.id, j.nume); }} className="text-gray-500 hover:text-red-500 dark:text-slate-400" title="Șterge"><TrashIcon className="w-5 h-5"/></button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                                Nu am găsit jurați care să corespundă criteriilor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedJudges.length > 0 ? (
                                paginatedJudges.map(j => {
                                    const count = assignments.filter(a => a.juratId === j.id).length;
                                    const completed = assignments.filter(a => a.juratId === j.id && a.status === Status.FINALIZAT).length;
                                    return (
                                        <div 
                                            key={j.id} 
                                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer"
                                            onClick={() => setEditingJurat(j)}
                                        >
                                            <div className="flex items-start justify-between z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ave-blue to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                                                        {j.nume.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={j.nume}>{j.nume}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1" title={j.profesie}>{j.profesie || 'Fără profesie'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                     <button onClick={(e) => { e.stopPropagation(); setEditingJurat(j); }} className="p-2 text-gray-400 hover:text-ave-blue rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Editează">
                                                        <PencilSquareIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); initiateDelete('jurat', j.id, j.nume); }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Șterge">
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 z-10 flex-grow">
                                                 {j.email && (
                                                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                                        <span className="w-4 h-4 text-gray-400 flex-shrink-0 text-center">@</span>
                                                        <span className="truncate" title={j.email}>{j.email}</span>
                                                     </div>
                                                 )}
                                                 {j.organizatie && (
                                                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                                        <span className="w-4 h-4 text-gray-400 flex-shrink-0 text-center">🏢</span>
                                                        <span className="truncate" title={j.organizatie}>{j.organizatie}</span>
                                                     </div>
                                                 )}
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center z-10 mt-auto">
                                                 <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Evaluări</span>
                                                    <span className="font-bold text-gray-900 dark:text-white text-lg leading-none">
                                                        {count}
                                                    </span>
                                                 </div>
                                                 <div className="flex flex-col items-end">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Finalizate</span>
                                                    <span className={`font-bold text-lg leading-none ${completed === count && count > 0 ? 'text-green-600' : 'text-ave-blue'}`}>
                                                         {completed}
                                                    </span>
                                                 </div>
                                            </div>
                                            
                                            {/* Decorative element */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent dark:from-slate-700/20 -mr-8 -mt-8 rounded-bl-full z-0 pointer-events-none" />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
                                    <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>Nu am găsit jurați care să corespundă criteriilor.</p>
                                </div>
                            )}
                        </div>
                    )}
                     {filteredJudges.length > judgesPerPage && (
                         <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-slate-700">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Afișare {Math.min((judgePage - 1) * judgesPerPage + 1, filteredJudges.length)} - {Math.min(judgePage * judgesPerPage, filteredJudges.length)} din {filteredJudges.length}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setJudgePage(p => Math.max(1, p - 1))}
                                    disabled={judgePage === 1}
                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                                >
                                    Anterior
                                </button>
                                <button 
                                    onClick={() => setJudgePage(p => Math.min(Math.ceil(filteredJudges.length / judgesPerPage), p + 1))}
                                    disabled={judgePage >= Math.ceil(filteredJudges.length / judgesPerPage)}
                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                                >
                                    Următor
                                </button>
                            </div>
                         </div>
                    )}
                </Card>
            )}

            {editingItem && (
                <ConfigEditModal 
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    {...props}
                    selectedStageId={selectedStage!}
                    selectedCategoryId={selectedCategory!}
                />
            )}
            {editingCandidate && (
                <CandidateEditModal 
                    candidate={editingCandidate}
                    onClose={() => setEditingCandidate(null)}
                    {...props}
                />
            )}
             {editingJurat && (
                <JuratEditModal 
                    jurat={editingJurat}
                    onClose={() => setEditingJurat(null)}
                    {...props}
                />
            )}
            {deletingItem && (
                <ConfirmDeleteModal
                    item={deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={confirmDelete}
                    criteria={criteria}
                    assignments={assignments}
                />
            )}
        </div>
    );
};

interface ConfirmDeleteModalProps {
    item: DeletingItem;
    onClose: () => void;
    onConfirm: () => void;
    criteria: Criterion[];
    assignments: Assignment[];
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ item, onClose, onConfirm, criteria, assignments }) => {
    const getDeletionDetails = () => {
        switch (item.type) {
            case 'stage':
                const criteriaCount = criteria.filter(c => c.etapaId === item.id).length;
                const assignmentsCount = assignments.filter(a => a.etapaId === item.id).length;
                return `Această acțiune este ireversibilă și va șterge și ${criteriaCount} criterii și ${assignmentsCount} asignări de evaluare asociate.`;
            case 'category':
                const catCriteriaCount = criteria.filter(c => c.categorieId === item.id).length;
                return `Această acțiune este ireversibilă și va șterge și ${catCriteriaCount} criterii asociate.`;
            case 'criterion':
                return 'Toate scorurile asociate acestui criteriu vor fi eliminate din evaluările existente.';
            case 'candidate':
                 const candAssignmentsCount = assignments.filter(a => a.candidatId === item.id).length;
                 return `Această acțiune este ireversibilă și va șterge și ${candAssignmentsCount} asignări de evaluare asociate.`;
            case 'jurat':
                const juratAssignmentsCount = assignments.filter(a => a.juratId === item.id).length;
                return `Această acțiune este ireversibilă și va șterge și ${juratAssignmentsCount} asignări de evaluare asociate acestui jurat.`;
            default:
                return 'Această acțiune este ireversibilă.';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <AlertTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-slate-100">Confirmare Ștergere</h3>
                    <div className="mt-2 text-sm text-gray-500 dark:text-slate-400 space-y-2">
                        <p>Sunteți sigur că doriți să ștergeți <strong className="text-gray-700 dark:text-slate-200">{`"${item.name}"`}</strong>?</p>
                        <p className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 rounded-md">{getDeletionDetails()}</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">Anulează</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Da, șterge</button>
                </div>
            </div>
        </div>
    );
};


interface CandidateEditModalProps extends AdminViewProps {
    candidate: Partial<Candidat>;
    onClose: () => void;
}

const CandidateEditModal: React.FC<CandidateEditModalProps> = ({ candidate, onClose, setCandidates, categories, addAuditLog, currentUser }) => {
    const [formData, setFormData] = useState<Partial<Candidat>>(() => {
        const base = { ...candidate };
        if (!base.extendedData) {
            let parsedData: DirectorFormData | undefined;
            if (base.submissionText) {
                try {
                    // Handle case where submissionText might be double-escaped or just a raw string
                    const rawText = base.submissionText.trim();
                    if (rawText.startsWith('{') || rawText.startsWith('[')) {
                         parsedData = JSON.parse(rawText);
                    } else {
                         // Attempt to cleanup potentially bad JSON or just log it
                         console.warn("submissionText does not look like JSON for candidate", base.id, rawText.substring(0, 50));
                    }
                } catch (e) {
                    console.error("Failed to parse submissionText for candidate", base.id, e);
                    // Fallback: Try to recover partial data if possible or just ignore
                }
            }

            if (parsedData) {
                base.extendedData = parsedData;
                // Ensure categorii map is consistent with categorieIds if needed, 
                // but usually submissionText is the source of truth for Form submissions.
            } else {
                base.extendedData = {
                    nume: base.nume || '',
                    prenume: '',
                    email: '',
                    confirmEmail: '',
                    telefon: '',
                    functieInceputAn: '',
                    functieInceputLuna: '',
                    aniActivitateSistem: '',
                    modOcupareFunctie: '',
                    aniConducereAcumulati: '',
                    judetUnitate: '',
                    localitateUnitate: '',
                    denumireUnitate: base.scoala || '',
                    adresaUnitate: '',
                    websiteUnitate: '',
                    regiuneUnitate: base.regiune || '',
                    niveluriInvatamant: {},
                    arePersonalitateJuridica: '',
                    statistici: {
                        eleviInscrisi: '', eleviRomi: '', eleviCES: '', eleviDezavantajati: 
                        '', eleviBursaSociala: '', eleviNavetisti: '', eleviAbandonScolar: '', 
                        personalDidacticTitular: '', personalDidacticSuplinitor: '', personalNedidactic: ''
                    },
                    categorii: (base.categorieIds || []).reduce((acc, id) => ({ ...acc, [id]: true }), {}),
                    proiecteNarative: {},
                    linkedinProfile: '',
                    facebookProfile: '',
                    otherProfile: '',
                    recomandari: [],
                    acordGDPR: false,
                    acordRegulament: false
                } as DirectorFormData;
            }
        }
        return base;
    });
    const [activeTab, setActiveTab] = useState('general');
    const isNew = !formData.id;

    const updateExtended = (path: string, value: any) => {
        setFormData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.extendedData) next.extendedData = {};
            
            const keys = path.split('.');
            const lastKey = keys.pop()!;
            const target = keys.reduce((obj: any, key: string) => {
                if (!obj[key]) obj[key] = {};
                return obj[key];
            }, next.extendedData);
            
            target[lastKey] = value;

            if (path === 'nume') next.nume = value + (next.extendedData.prenume ? ' ' + next.extendedData.prenume : '');
            if (path === 'prenume') next.nume = (next.extendedData.nume || '') + ' ' + value;
            if (path === 'denumireUnitate') next.scoala = value;
            if (path === 'regiuneUnitate') next.regiune = value;
            
            return next;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const prevIds = prev.categorieIds || [];
            const nextIds = checked ? [...prevIds, value] : prevIds.filter(id => id !== value);
            
            const nextExtended = prev.extendedData ? { ...prev.extendedData } : {} as DirectorFormData;
            if (nextExtended.categorii) {
                nextExtended.categorii = { ...nextExtended.categorii, [value]: checked };
            } else {
                nextExtended.categorii = { [value]: checked };
            }

            return { ...prev, categorieIds: nextIds, extendedData: nextExtended };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { nume, scoala, categorieIds, regiune } = formData;
        if (!nume || !nume.trim() || !scoala || !scoala.trim() || !categorieIds || categorieIds.length === 0 || !regiune) {
            alert("Vă rugăm completați toate câmpurile obligatorii, inclusiv cel puțin o categorie.");
            return;
        }

        if (isNew) {
            const newCandidate: Candidat = {
                id: `c-${Date.now()}`,
                nume: formData.nume!,
                titlu: formData.titlu || '',
                scoala: formData.scoala!,
                regiune: formData.regiune!,
                categorieIds: formData.categorieIds!,
                extendedData: formData.extendedData
            };
            setCandidates(prev => [...prev, newCandidate]);
             addAuditLog({
                adminId: currentUser.id,
                actiune: 'Creare Candidat',
                detalii: {
                    candidatId: newCandidate.id,
                    numeCandidat: newCandidate.nume,
                    motiv: `Candidatul "${newCandidate.nume}" a fost adăugat în sistem.`
                }
            });
        } else {
            setCandidates(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } as Candidat : c));
        }
        onClose();
    };


    const renderField = (label: string, path: string, type = 'text', placeholder = '', options: string[] = []) => {
        const value = path.split('.').reduce((o, k) => (o || {})[k], formData.extendedData) || '';
        return (
            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
                {type === 'textarea' ? (
                    <textarea 
                        value={value}
                        onChange={e => updateExtended(path, e.target.value)}
                        className="w-full text-sm rounded-md border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        placeholder={placeholder}
                        rows={4}
                    />
                ) : type === 'select' ? (
                    <select
                        value={value}
                        onChange={e => updateExtended(path, e.target.value)}
                        className="w-full text-sm rounded-md border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    >
                        <option value="">Selectează...</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input 
                        type={type}
                        value={value}
                        onChange={e => updateExtended(path, e.target.value)}
                        className="w-full text-sm rounded-md border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        placeholder={placeholder}
                    />
                )}
            </div>
        );
    };

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'experienta', label: 'Experiență' },
        { id: 'unitate', label: 'Unitate Învățământ' },
        { id: 'statistici', label: 'Statistici' },
        { id: 'categorii', label: 'Categorii' },
        { id: 'social', label: 'Social & Recomandări' },
        { id: 'proiecte', label: 'Proiecte' },
    ];

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{isNew ? "Adaugă Candidat Nou" : "Editează Candidat"}</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 text-2xl leading-none">&times;</button>
                </header>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 bg-gray-50 dark:bg-slate-700/30 border-r dark:border-slate-700 flex flex-col overflow-y-auto">
                        {tabs.map(tab => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-3 text-left text-sm font-medium border-l-4 transition-colors ${
                                    activeTab === tab.id 
                                    ? 'bg-white dark:bg-slate-800 border-ave-blue text-ave-blue' 
                                    : 'border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Informații Generale</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField('Nume', 'nume', 'text', 'Popescu')}
                                    {renderField('Prenume', 'prenume', 'text', 'Ion')}
                                    {renderField('Email', 'email', 'email', 'ion.popescu@email.com')}
                                    {renderField('Telefon', 'telefon', 'tel', '07xxxxxxxx')}
                                </div>
                            </div>
                        )}

                        {activeTab === 'experienta' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Experiență Profesională</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField('An început funcție', 'functieInceputAn', 'number', '2020')}
                                    {renderField('Lună început funcție', 'functieInceputLuna', 'text', 'Septembrie')}
                                    {renderField('Ani activitate sistem', 'aniActivitateSistem', 'number')}
                                    {renderField('Ani conducere acumulați', 'aniConducereAcumulati', 'number')}
                                    {renderField('Mod ocupare funcție', 'modOcupareFunctie', 'select', '', ['Concurs', 'Numire', 'Delegare', 'Altă situație'])}
                                    {renderField('Detalii mod ocupare', 'modOcupareDetalii')}
                                </div>
                            </div>
                        )}

                        {activeTab === 'unitate' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Unitate de Învățământ</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {renderField('Denumire Unitate', 'denumireUnitate')}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField('Județ', 'judetUnitate')}
                                        {renderField('Localitate', 'localitateUnitate')}
                                        {renderField('Regiune', 'regiuneUnitate', 'select', '', Object.values(Regiune))}
                                        {renderField('Website', 'websiteUnitate')}
                                    </div>
                                    {renderField('Adresă', 'adresaUnitate', 'textarea')}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField('Personalitate Juridică', 'arePersonalitateJuridica', 'select', '', ['da', 'nu'])}
                                        {renderField('Unitate Părinte (dacă nu are pers. juridică)', 'unitateParinte')}
                                    </div>
                                    
                                    <div className="mt-4">
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">Niveluri de Învățământ</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {['Prescolar', 'Primar', 'Gimnazial', 'Liceal', 'Profesional', 'Postliceal'].map(level => {
                                                const checked = formData.extendedData?.niveluriInvatamant?.[level] || false;
                                                return (
                                                    <label key={level} className="flex items-center space-x-2 text-sm">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={checked}
                                                            onChange={e => updateExtended(`niveluriInvatamant.${level}`, e.target.checked)}
                                                            className="rounded border-gray-300 text-ave-blue focus:ring-ave-blue"
                                                        />
                                                        <span className="dark:text-slate-300">{level}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'statistici' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Statistici 2024-2025</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField('Elevi Înscriși', 'statistici.eleviInscrisi', 'number')}
                                    {renderField('Elevi Romi', 'statistici.eleviRomi', 'number')}
                                    {renderField('Elevi CES', 'statistici.eleviCES', 'number')}
                                    {renderField('Elevi Dezavantajați', 'statistici.eleviDezavantajati', 'number')}
                                    {renderField('Elevi Bursă Socială', 'statistici.eleviBursaSociala', 'number')}
                                    {renderField('Elevi Navetiști', 'statistici.eleviNavetisti', 'number')}
                                    {renderField('Abandon Școlar (an anterior)', 'statistici.eleviAbandonScolar', 'number')}
                                    <div className="col-span-2 border-t pt-4 mt-2"></div>
                                    {renderField('Personal Didactic Titular', 'statistici.personalDidacticTitular', 'number')}
                                    {renderField('Personal Didactic Suplinitor', 'statistici.personalDidacticSuplinitor', 'number')}
                                    {renderField('Personal Nedidactic', 'statistici.personalNedidactic', 'number')}
                                </div>
                            </div>
                        )}

                        {activeTab === 'categorii' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Categorii de Participare</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {categories.map(c => (
                                        <div key={c.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                id={`cat-modal-${c.id}`}
                                                value={c.id}
                                                checked={formData.categorieIds?.includes(c.id) || false}
                                                onChange={handleCategoryChange}
                                                className="h-5 w-5 rounded border-gray-300 text-ave-blue focus:ring-ave-blue dark:bg-slate-600 dark:border-slate-500"
                                            />
                                            <label htmlFor={`cat-modal-${c.id}`} className="ml-3 text-sm font-medium text-gray-900 dark:text-slate-200 cursor-pointer flex-1">
                                                {c.nume}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Social Media & Recomandări</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {renderField('Profil LinkedIn', 'linkedinProfile')}
                                    {renderField('Profil Facebook', 'facebookProfile')}
                                    {renderField('Alt Profil', 'otherProfile')}
                                </div>
                                <div className="mt-6">
                                    <h5 className="font-semibold text-gray-700 dark:text-slate-300 mb-2">Recomandări</h5>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                                        Recomandările nu pot fi editate direct aici momentan.
                                    </div>
                                    {formData.extendedData?.recomandari?.length ? (
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-400">
                                            {formData.extendedData.recomandari.map((rec: any, idx: number) => (
                                                <li key={idx}>{rec.nume} - {rec.functie} ({rec.telefon})</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Nu există recomandări.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'proiecte' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200 border-b pb-2 mb-4">Proiecte Narative</h4>
                                {['inovare', 'egalitate', 'antreprenoriat'].map((projKey) => {
                                    const proj = formData.extendedData?.proiecteNarative?.[projKey as keyof typeof formData.extendedData.proiecteNarative];
                                    if (!proj) return null;
                                    const catName = categories.find(c => c.id.toLowerCase().includes(projKey))?.nume || projKey.toUpperCase();
                                    
                                    return (
                                        <div key={projKey} className="border dark:border-slate-600 rounded-lg p-4 mb-4">
                                            <h5 className="font-bold text-ave-blue mb-2">{catName}</h5>
                                            <div className="grid grid-cols-1 gap-4">
                                                {renderField('Model de Intervenție', `proiecteNarative.${projKey}.modelInterventie`, 'textarea')}
                                                {renderField('Schimbări Produse', `proiecteNarative.${projKey}.schimbariProduse`, 'textarea')}
                                                {renderField('Strategie Comunicare', `proiecteNarative.${projKey}.strategieComunicare`, 'textarea')}
                                            </div>
                                            
                                            {/* Documente Justificative */}
                                            {proj.documenteJustificative && proj.documenteJustificative.length > 0 && (
                                                <div className="mt-6">
                                                    <h6 className="font-semibold text-gray-700 dark:text-slate-300 mb-2 text-sm">Documente Justificative</h6>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {proj.documenteJustificative.map((doc: any, docIdx: number) => (
                                                            <div key={docIdx} className="group relative aspect-video bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
                                                                {doc.content && (doc.content.startsWith('data:image') || doc.type.startsWith('image')) ? (
                                                                    <img 
                                                                        src={doc.content} 
                                                                        alt={doc.name} 
                                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                                        onClick={() => {
                                                                            const win = window.open();
                                                                            win?.document.write(`<img src="${doc.content}" style="max-width:100%"/>`);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <DocumentDuplicateIcon className="w-8 h-8" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-white truncate px-2">
                                                                    {doc.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {(!formData.extendedData?.proiecteNarative || Object.keys(formData.extendedData.proiecteNarative).length === 0) && (
                                    <p className="text-sm text-gray-500">Nu există proiecte narative completate.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-5 border-t dark:border-slate-700 flex justify-end space-x-3 bg-gray-50 dark:bg-slate-800 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anulează</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue">Salvează</button>
                </footer>
            </form>
        </div>
    );
};


interface JuratEditModalProps extends AdminViewProps {
    jurat: Partial<Jurat>;
    onClose: () => void;
}

const JuratEditModal: React.FC<JuratEditModalProps> = ({ jurat, onClose, setJudges, addAuditLog, currentUser, stages }) => {
    const [formData, setFormData] = useState<Partial<Jurat>>(jurat);
    const isNew = !formData.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nume = formData.nume;
        if (typeof nume !== 'string' || !nume.trim()) {
            alert("Numele juratului nu poate fi gol.");
            return;
        }

        if (isNew) {
            const newJurat: Jurat = {
                ...formData as Jurat,
                id: `j-${Date.now()}`,
                nume: nume,
                rol: UserRole.JUDGE,
            };
            setJudges(prev => [...prev, newJurat]);
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Creare Jurat',
                detalii: {
                    juratId: newJurat.id,
                    numeJurat: newJurat.nume,
                    motiv: `Juratul "${newJurat.nume}" a fost adăugat în sistem.`
                }
            });
        } else {
            setJudges(prev => prev.map(j => j.id === formData.id ? { ...j, ...formData } as Jurat : j));
        }
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">{isNew ? "Adaugă Jurat Nou" : "Editează Jurat"}</h3>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-sm">Nume Jurat *</label>
                            <input type="text" name="nume" value={formData.nume || ''} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Telefon</label>
                            <input type="tel" name="telefon" value={formData.telefon || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Profesie/Funcție</label>
                            <input type="text" name="profesie" value={formData.profesie || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Organizație</label>
                            <input type="text" name="organizatie" value={formData.organizatie || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold text-sm">Etape Asignate</label>
                        <div className="flex flex-wrap gap-2">
                            {stages.map(stage => (
                                <label key={stage.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700 p-2 rounded border dark:border-slate-600">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.stages?.includes(stage.id) || false} 
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFormData(prev => {
                                                const currentStages = prev.stages || [];
                                                const newStages = isChecked 
                                                    ? [...currentStages, stage.id]
                                                    : currentStages.filter(id => id !== stage.id);
                                                return { ...prev, stages: newStages };
                                            });
                                        }}
                                        className="rounded border-gray-300 text-ave-blue focus:ring-ave-blue" 
                                    />
                                    <span className="text-sm">{stage.nume}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold text-sm">Social Media</label>
                        <input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} placeholder="LinkedIn URL" className="w-full border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 text-sm" />
                        <input type="url" name="facebook_url" value={formData.facebook_url || ''} onChange={handleChange} placeholder="Facebook URL" className="w-full border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 text-sm" />
                        <input type="url" name="instagram_url" value={formData.instagram_url || ''} onChange={handleChange} placeholder="Instagram URL" className="w-full border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 text-sm" />
                    </div>

                    <div>
                        <label className="font-semibold text-sm">Motivație</label>
                        <textarea name="motivatie" value={formData.motivatie || ''} onChange={handleChange} rows={4} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>

                    <div>
                        <label className="font-semibold text-sm">Poză Profil</label>
                        <div className="flex items-center gap-4 mt-1">
                            {formData.foto_url && (
                                <img src={formData.foto_url} alt="Preview" className="h-20 w-20 object-cover rounded-full border" />
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ave-blue file:text-white hover:file:bg-ave-dark-blue" 
                            />
                        </div>
                    </div>

                </div>
                <footer className="p-5 border-t dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anulează</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue">Salvează</button>
                </footer>
            </form>
        </div>
    );
};

interface ConfigEditModalProps extends AdminViewProps {
    item: EditingItem;
    onClose: () => void;
    selectedStageId: string;
    selectedCategoryId: string;
}

const ConfigEditModal: React.FC<ConfigEditModalProps> = ({ item, onClose, setStages, setCategories, setCriteria, selectedStageId, selectedCategoryId, criteria }) => {
    const [formData, setFormData] = useState(item.data);
    const isNew = !('id' in item.data);
    
    const titles: Record<EditingItem['type'], string> = {
        stage: isNew ? "Adaugă Etapă Nouă" : "Editează Etapă",
        category: isNew ? "Adaugă Categorie Nouă" : "Editează Categorie",
        criterion: isNew ? "Adaugă Criteriu Nou" : "Editează Criteriu",
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const val = isCheckbox ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) : value);
        setFormData(prev => ({...prev, [name]: val }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ('nume' in formData) {
            const nume = (formData as { nume?: unknown }).nume;
            if (typeof nume !== 'string' || !nume.trim()) {
                alert("Numele nu poate fi gol.");
                return;
            }
        }

        switch (item.type) {
            case 'stage':
                const stageData = formData as Stage;
                setStages(prev => {
                    let newStages;
                    if (isNew) {
                        newStages = [...prev, { ...stageData, id: `stage-${Date.now()}` }];
                    } else {
                        newStages = prev.map(s => s.id === stageData.id ? stageData : s);
                    }
                    
                    // If the updated/new stage is set as Current, unset others
                    if (stageData.isCurrent) {
                        newStages = newStages.map(s => 
                            (s.id === (isNew ? `stage-${Date.now()}` : stageData.id)) 
                                ? s 
                                : { ...s, isCurrent: false }
                        );
                    }
                    
                    return newStages;
                });
                break;
            case 'category':
                 setCategories(prev => isNew 
                    ? [...prev, { ...(formData as Category), id: `cat-${Date.now()}` }] 
                    : prev.map(c => c.id === (formData as Category).id ? (formData as Category) : c)
                );
                break;
            case 'criterion':
                const newOrUpdated = isNew 
                  ? { ...(formData as Criterion), id: `crit-${Date.now()}`, etapaId: selectedStageId, categorieId: selectedCategoryId } 
                  : (formData as Criterion);

                const relevantPrev = criteria.filter(c => c.etapaId === selectedStageId && c.categorieId === selectedCategoryId);
                const nextRelevant = isNew 
                  ? [...relevantPrev, newOrUpdated] 
                  : relevantPrev.map(c => c.id === newOrUpdated.id ? newOrUpdated : c);
                setCriteria(prev => {
                  const others = prev.filter(c => !(c.etapaId === selectedStageId && c.categorieId === selectedCategoryId));
                  return [...others, ...nextRelevant];
                });
                break;
        }
        onClose();
    }

    const renderFormFields = () => {
        switch (item.type) {
            case 'stage':
                const stageData = formData as Stage;
                return (
                    <>
                        <div>
                            <label className="font-semibold text-sm">Nume Etapă</label>
                            <input type="text" name="nume" value={stageData.nume} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="activ" id="activ" checked={stageData.activ} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-ave-blue focus:ring-ave-blue dark:bg-slate-600 dark:border-slate-500" />
                                <label htmlFor="activ">Este etapa activă? (vizibilă în filtre)</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    name="isCurrent" 
                                    id="isCurrent" 
                                    checked={stageData.isCurrent || false} 
                                    onChange={(e) => {
                                        // If setting as current, we need to make sure others are unset in the parent state, 
                                        // but here we just update local form data. The save logic should handle exclusive set.
                                        setFormData(prev => ({ ...prev, isCurrent: e.target.checked }));
                                    }} 
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:bg-slate-600 dark:border-slate-500" 
                                />
                                <label htmlFor="isCurrent" className="font-bold text-green-700 dark:text-green-400">Este etapa CURENTĂ (în desfășurare)?</label>
                            </div>
                        </div>
                    </>
                );
            case 'category':
                const catData = formData as Category;
                return (
                    <div>
                        <label className="font-semibold text-sm">Nume Categorie</label>
                        <input type="text" name="nume" value={catData.nume} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                );
            case 'criterion':
                 const critData = formData as Criterion;
                return (
                    <>
                         <div>
                            <label className="font-semibold text-sm">Nume Criteriu</label>
                            <input type="text" name="nume" value={critData.nume} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Descriere</label>
                            <textarea name="descriere" value={critData.descriere} onChange={handleChange} rows={3} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold text-sm">Scor Min</label>
                                <input type="number" name="scorMin" value={critData.scorMin} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Scor Max</label>
                                <input type="number" name="scorMax" value={critData.scorMax} onChange={handleChange} required className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                            </div>
                        </div>
                    </>
                )
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">{titles[item.type]}</h3>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {renderFormFields()}
                </div>
                <footer className="p-5 border-t dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anulează</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue">Salvează</button>
                </footer>
            </form>
        </div>
    )
};

const AddAssignmentModal: React.FC<AdminViewProps & {onClose: () => void}> = (props) => {
    const { onClose, candidates, judges, stages, assignments, setAssignments, categories } = props;
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
    const [selectedStageId, setSelectedStageId] = useState<string>(stages.find(s => s.activ)?.id || stages[0]?.id || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const candidateCategories = useMemo(() => {
        const candidate = candidates.find(c => c.id === selectedCandidateId);
        if (!candidate) return [];
        return candidate.categorieIds.map(id => categories.find(c => c.id === id)).filter(Boolean) as Category[];
    }, [selectedCandidateId, candidates, categories]);

    useEffect(() => {
        // Reset category if candidate changes and old category is no longer valid
        if (selectedCategoryId && !candidateCategories.some(c => c.id === selectedCategoryId)) {
            setSelectedCategoryId('');
        }
    }, [selectedCandidateId, selectedCategoryId, candidateCategories]);


    const handleAddAssignment = () => {
        if (!selectedCandidateId || !selectedJudgeId || !selectedStageId || !selectedCategoryId) {
            alert("Vă rugăm selectați un candidat, un jurat, o etapă și o categorie.");
            return;
        }

        const alreadyExists = assignments.some(a =>
            a.candidatId === selectedCandidateId &&
            a.juratId === selectedJudgeId &&
            a.etapaId === selectedStageId &&
            a.categorieId === selectedCategoryId
        );

        if (alreadyExists) {
            alert("Această asignare există deja.");
            return;
        }

        const newAssignment: Assignment = {
            id: `a-${selectedCandidateId}-${selectedJudgeId}-${selectedStageId}-${selectedCategoryId}-${Date.now()}`,
            candidatId: selectedCandidateId,
            juratId: selectedJudgeId,
            etapaId: selectedStageId,
            categorieId: selectedCategoryId,
            status: Status.NEINCEPUT,
            scoruri: {},
            observatii: {},
            lastModified: new Date()
        };

        setAssignments(prev => [...prev, newAssignment]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">Adaugă Asignare Manuală</h3>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold text-sm">Candidat</label>
                        <select value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark]">
                            <option value="">Selectează un candidat...</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.nume} - {c.scoala}</option>)}
                        </select>
                    </div>
                    {selectedCandidateId && (
                        <div>
                            <label className="font-semibold text-sm">Categorie</label>
                            <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark]" disabled={candidateCategories.length === 0}>
                                <option value="">Selectează o categorie...</option>
                                {candidateCategories.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                            </select>
                        </div>
                    )}
                     <div>
                        <label className="font-semibold text-sm">Jurat</label>
                        <select value={selectedJudgeId} onChange={e => setSelectedJudgeId(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark]">
                             <option value="">Selectează un jurat...</option>
                            {judges.map(j => <option key={j.id} value={j.id}>{j.nume}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="font-semibold text-sm">Etapă</label>
                        <select value={selectedStageId} onChange={e => setSelectedStageId(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark]">
                            {stages.map(s => <option key={s.id} value={s.id}>{s.nume}</option>)}
                        </select>
                    </div>
                </div>
                <footer className="p-5 border-t dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anulează</button>
                    <button type="button" onClick={handleAddAssignment} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue">Confirmă Asignarea</button>
                </footer>
            </div>
        </div>
    );
};

const BulkAssignmentModal: React.FC<AdminViewProps & {onClose: () => void}> = (props) => {
    const { onClose, candidates, judges, stages, assignments, setAssignments, categories, addAuditLog, currentUser } = props;
    const [selectedStageId, setSelectedStageId] = useState<string>(stages.find(s => s.activ)?.id || stages[0]?.id || '');
    const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
    const [filterText, setFilterText] = useState('');
    const [distributeCount, setDistributeCount] = useState<number>(3); // Default 3 judges per candidate

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => c.nume.toLowerCase().includes(filterText.toLowerCase()));
    }, [candidates, filterText]);

    const handleSmartDistribute = () => {
        if (selectedCandidateIds.length === 0 || selectedJudgeIds.length === 0 || !selectedStageId) {
            alert("Selectați cel puțin un candidat, un jurat și o etapă.");
            return;
        }

        let newAssignments: Assignment[] = [];
        let createdCount = 0;
        
        // Helper to shuffle array
        const shuffle = (array: string[]) => array.sort(() => Math.random() - 0.5);

        // Map candidate ID to their categories
        const candidateCategoriesMap = new Map<string, string[]>();
        candidates.forEach(c => {
            if (selectedCandidateIds.includes(c.id)) {
                candidateCategoriesMap.set(c.id, c.categorieIds);
            }
        });

        // Current assignment counts for load balancing (simple approach)
        const judgeLoad: Record<string, number> = {};
        selectedJudgeIds.forEach(id => judgeLoad[id] = 0);

        selectedCandidateIds.forEach(cId => {
            const cCategories = candidateCategoriesMap.get(cId) || [];
            
            cCategories.forEach(catId => {
                // Find judges who haven't assigned this candidate yet
                const availableJudges = selectedJudgeIds.filter(jId => {
                    const exists = assignments.some(a => 
                        a.candidatId === cId && 
                        a.juratId === jId && 
                        a.etapaId === selectedStageId && 
                        a.categorieId === catId
                    );
                    return !exists;
                });

                // Sort judges by current load (ascending) then random
                const sortedJudges = shuffle(availableJudges).sort((a, b) => judgeLoad[a] - judgeLoad[b]);

                // Pick top N judges
                const judgesToAssign = sortedJudges.slice(0, distributeCount);

                judgesToAssign.forEach(jId => {
                    const newAssignment: Assignment = {
                        id: `a-smart-${cId}-${jId}-${selectedStageId}-${catId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        candidatId: cId,
                        juratId: jId,
                        etapaId: selectedStageId,
                        categorieId: catId,
                        status: Status.NEINCEPUT,
                        scoruri: {},
                        observatii: {},
                        lastModified: new Date()
                    };
                    newAssignments.push(newAssignment);
                    createdCount++;
                    judgeLoad[jId]++;
                });
            });
        });

        if (createdCount > 0) {
            setAssignments(prev => [...prev, ...newAssignments]);
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Asignare Inteligentă',
                detalii: {
                    etapaId: selectedStageId,
                    motiv: `S-au distribuit ${createdCount} asignări noi (${distributeCount} jurați/candidat).`
                }
            });
            alert(`Distribuire completă! Au fost create ${createdCount} asignări.`);
            onClose();
        } else {
            alert("Nu au fost create asignări noi. Verificați dacă candidații au deja numărul dorit de jurați.");
        }
    };

    const handleAssign = () => {
        if (selectedCandidateIds.length === 0 || selectedJudgeIds.length === 0 || !selectedStageId) {
            alert("Selectați cel puțin un candidat, un jurat și o etapă.");
            return;
        }

        const newAssignments: Assignment[] = [];
        let createdCount = 0;

        selectedCandidateIds.forEach(cId => {
            const candidate = candidates.find(c => c.id === cId);
            if (!candidate) return;
            
            candidate.categorieIds.forEach(catId => {
                selectedJudgeIds.forEach(jId => {
                    const exists = assignments.some(a => 
                        a.candidatId === cId && 
                        a.juratId === jId && 
                        a.etapaId === selectedStageId && 
                        a.categorieId === catId
                    );

                    if (!exists) {
                        const newAssignment: Assignment = {
                            id: `a-bulk-${cId}-${jId}-${selectedStageId}-${catId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            candidatId: cId,
                            juratId: jId,
                            etapaId: selectedStageId,
                            categorieId: catId,
                            status: Status.NEINCEPUT,
                            scoruri: {},
                            observatii: {},
                            lastModified: new Date()
                        };
                        newAssignments.push(newAssignment);
                        createdCount++;
                    }
                });
            });
        });

        if (createdCount > 0) {
            setAssignments(prev => [...prev, ...newAssignments]);
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Asignare Multiplă',
                detalii: {
                    etapaId: selectedStageId,
                    motiv: `S-au creat ${createdCount} asignări noi (Bulk).`
                }
            });
            alert(`Au fost create ${createdCount} asignări.`);
            onClose();
        } else {
            alert("Nu au fost create asignări noi (probabil există deja).");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-ave-dark-blue dark:text-slate-100">Asignare Multiplă</h3>
                </header>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-grow">
                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                        <label className="font-bold dark:text-slate-200">1. Alege Etapa</label>
                        <select 
                            value={selectedStageId} 
                            onChange={e => setSelectedStageId(e.target.value)}
                            className="w-full border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        >
                            {stages.filter(s => s.activ).map(s => (
                                <option key={s.id} value={s.id}>{s.nume}</option>
                            ))}
                        </select>

                        <div className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                            <label className="font-bold text-sm text-blue-800 dark:text-blue-300 block mb-1">Opțiuni Smart Distribute</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-700 dark:text-blue-400">Jurați per candidat:</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    value={distributeCount} 
                                    onChange={e => setDistributeCount(parseInt(e.target.value) || 1)}
                                    className="w-16 h-8 text-sm border-blue-200 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <label className="font-bold mt-2 dark:text-slate-200">2. Alege Jurați ({selectedJudgeIds.length})</label>
                        <div className="border rounded-md p-2 overflow-y-auto flex-grow dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30">
                            {judges.map(j => (
                                <label key={j.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedJudgeIds.includes(j.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedJudgeIds(p => [...p, j.id]);
                                            else setSelectedJudgeIds(p => p.filter(id => id !== j.id));
                                        }}
                                        className="rounded border-gray-300 text-ave-blue focus:ring-ave-blue dark:bg-slate-600 dark:border-slate-500"
                                    />
                                    <span className="text-sm dark:text-slate-200">{j.nume}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                        <label className="font-bold dark:text-slate-200">3. Alege Candidați ({selectedCandidateIds.length})</label>
                        <input 
                            type="text" 
                            placeholder="Caută candidați..." 
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="w-full border-gray-300 rounded-md text-sm p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        />
                        <div className="flex gap-2 text-xs">
                            <button onClick={() => setSelectedCandidateIds(filteredCandidates.map(c => c.id))} className="text-ave-blue hover:underline dark:text-blue-400">Selectează toți filtrați</button>
                            <button onClick={() => setSelectedCandidateIds([])} className="text-red-500 hover:underline dark:text-red-400">Deselectează toți</button>
                        </div>
                        <div className="border rounded-md p-2 overflow-y-auto flex-grow dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30">
                            {filteredCandidates.map(c => (
                                <label key={c.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCandidateIds.includes(c.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedCandidateIds(p => [...p, c.id]);
                                            else setSelectedCandidateIds(p => p.filter(id => id !== c.id));
                                        }}
                                        className="rounded border-gray-300 text-ave-blue focus:ring-ave-blue dark:bg-slate-600 dark:border-slate-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold dark:text-slate-200">{c.nume}</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400">{c.scoala}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="p-4 border-t dark:border-slate-700 flex justify-end gap-2 flex-wrap">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-200">Anulează</button>
                    <button onClick={handleSmartDistribute} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700">Smart Distribute (Random)</button>
                    <button onClick={handleAssign} className="px-4 py-2 rounded-lg text-sm font-semibold bg-ave-blue text-white hover:bg-ave-dark-blue">Asignează Manual ({selectedCandidateIds.length * selectedJudgeIds.length})</button>
                </footer>
            </div>
        </div>
    );
};

interface ObservationsModalProps {
    assignment: Assignment;
    candidate: Candidat;
    judge: Jurat;
    criteria: Criterion[];
    onClose: () => void;
}

const ObservationsModal: React.FC<ObservationsModalProps> = ({ assignment, candidate, judge, criteria, onClose }) => {
    const relevantCriteria = criteria.filter(c => 
        c.etapaId === assignment.etapaId && 
        c.categorieId === assignment.categorieId
    );

    const hasAnyObservations = Object.values(assignment.observatii).some(obs => obs && typeof obs === 'string' && obs.trim() !== '');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-ave-dark-blue dark:text-slate-100">Observații Jurat</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Feedback de la <strong>{judge.nume}</strong> pentru <strong>{candidate.nume}</strong>
                    </p>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {hasAnyObservations ? (
                        relevantCriteria.map(criterion => {
                            const observation = assignment.observatii[criterion.id];
                            const score = assignment.scoruri[criterion.id];

                            if (!observation || observation.trim() === '') {
                                return null;
                            }

                            return (
                                <div key={criterion.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-800 dark:text-slate-200">{criterion.nume}</h4>
                                        {score !== undefined && (
                                            <span className="font-bold text-ave-blue text-lg">{score}</span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{observation}</p>
                                </div>
                            );
                        })
                    ) : (
                         <p className="text-center text-gray-500 dark:text-slate-400 py-4">Acest jurat nu a lăsat nicio observație scrisă pentru această evaluare.</p>
                    )}
                </div>
                <footer className="p-4 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700">Închide</button>
                </footer>
            </div>
        </div>
    );
};

interface AssignmentAuditModalProps {
    assignment: Assignment;
    onClose: () => void;
    auditLogs: AuditLog[];
    criteria: Criterion[];
    candidate: Candidat;
    judge: Jurat;
}

const AssignmentAuditModal: React.FC<AssignmentAuditModalProps> = ({ assignment, onClose, auditLogs, criteria, candidate, judge }) => {
    const relevantLogs = useMemo(() => {
        return auditLogs
            .filter(log =>
                log.actiune.includes('Modificare Scor') &&
                log.detalii.candidatId === assignment.candidatId &&
                log.detalii.juratId === assignment.juratId
            )
            .map(log => {
                const criterion = criteria.find(c => c.id === log.detalii.criteriuId);
                return { ...log, criterion };
            })
            .filter(logWithCriterion =>
                logWithCriterion.criterion &&
                logWithCriterion.criterion.etapaId === assignment.etapaId &&
                logWithCriterion.criterion.categorieId === assignment.categorieId
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [auditLogs, criteria, assignment]);

    const getAdminName = (adminId: string) => ADMINI.find(a => a.id === adminId)?.nume || adminId;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-ave-dark-blue dark:text-slate-100">Istoric Modificări Scor</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Evaluare pentru <strong>{candidate.nume}</strong> de către <strong>{judge.nume}</strong>
                    </p>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {relevantLogs.length > 0 ? (
                        <ul className="space-y-4">
                            {relevantLogs.map(log => (
                                <li key={log.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="flex justify-between items-start text-xs text-gray-500 dark:text-slate-400 mb-2">
                                        <span>{log.timestamp.toLocaleString('ro-RO')}</span>
                                        <span>{getAdminName(log.adminId)}</span>
                                    </div>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200">
                                        Criteriu: {log.criterion?.nume || 'N/A'}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-sm font-mono bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">{log.detalii.scorVechi}</span>
                                        <span className="font-semibold">→</span>
                                        <span className="text-sm font-mono bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">{log.detalii.scorNou}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                                        <span className="font-semibold">Motiv:</span> {log.detalii.motiv}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-400 py-8">Nicio modificare de scor înregistrată pentru această evaluare.</p>
                    )}
                </div>
                <footer className="p-4 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700">Închide</button>
                </footer>
            </div>
        </div>
    );
};

const AssignmentCell: React.FC<{
    assignment: Assignment | undefined;
    onDelete: () => void;
    onAdd: () => void;
    onEdit: () => void;
    onViewObservations: () => void;
    onViewAudit: () => void;
}> = ({ assignment, onDelete, onAdd, onEdit, onViewObservations, onViewAudit }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    if (assignment) {
        const hasObservations = Object.values(assignment.observatii).some(obs => obs && typeof obs === 'string' && obs.trim() !== '');
        return (
            <div className="flex items-center justify-center group/cell relative h-full w-full" onBlur={() => setIsMenuOpen(false)} tabIndex={-1}>
                <div 
                    onClick={() => { setIsMenuOpen(false); onEdit(); }}
                    className={`w-full mx-1 py-1.5 rounded text-xs font-bold truncate cursor-pointer transition-all border shadow-sm ${
                    assignment.status === Status.FINALIZAT ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                    assignment.status === Status.IN_CURS ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                    'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                }`}>
                    {assignment.status === Status.FINALIZAT ? assignment.scorFinal?.toFixed(2) || 'N/A' : (
                        assignment.status === Status.IN_CURS ? 'In Curs' : 'Neinceput'
                    )}
                </div>
                
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
                    className={`absolute -top-2 -right-1 shadow-lg border dark:border-slate-600 rounded-full p-1 z-20 scale-90 transition-colors ${
                        hasObservations ? 'bg-white dark:bg-slate-800 text-ave-blue' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300'
                    }`}
                    aria-label="Acțiuni"
                    title="Acțiuni"
                >
                    <span className="text-xs font-black leading-none px-1">⋯</span>
                </button>

                {isMenuOpen && (
                    <div className="absolute top-6 right-0 z-30 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                        {hasObservations && (
                            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onViewObservations(); }} className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <ChatBubbleLeftIcon className="w-4 h-4 text-ave-blue" />
                                Observații
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onViewAudit(); }} className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-ave-blue" />
                            Audit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete(); }} className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" />
                            Șterge
                        </button>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="flex justify-center h-full items-center group/empty">
            <button 
                onClick={onAdd} 
                className="w-full mx-1 py-1.5 rounded border-2 border-dashed border-gray-100 hover:border-ave-blue hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-gray-300 hover:text-ave-blue dark:text-slate-600 dark:hover:text-blue-400"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

interface AssignmentManagementProps extends AdminViewProps {
    viewMode: 'matrix' | 'focus';
    setViewMode: (mode: 'matrix' | 'focus') => void;
    selectedStageId: string;
    setSelectedStageId: (id: string) => void;
    focusType: 'judge' | 'candidate';
    setFocusType: (type: 'judge' | 'candidate') => void;
    selectedFocusId: string | null;
    setSelectedFocusId: (id: string | null) => void;
    statusFilter: Status | 'all' | 'pending';
    setStatusFilter: (status: Status | 'all' | 'pending') => void;
}

const AssignmentManagement: React.FC<AssignmentManagementProps> = (props) => {
    const { candidates, judges, assignments, setAssignments, stages, addAuditLog, currentUser, criteria, categories, auditLogs,
            viewMode, setViewMode, selectedStageId, setSelectedStageId, focusType, setFocusType, selectedFocusId, setSelectedFocusId,
            statusFilter, setStatusFilter, setCandidates
    } = props;

    const [summaryCandidate, setSummaryCandidate] = useState<Candidat | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [judgeSearchTerm, setJudgeSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [viewingObservationsAssignment, setViewingObservationsAssignment] = useState<Assignment | null>(null);
    const [viewingAuditAssignment, setViewingAuditAssignment] = useState<Assignment | null>(null);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedJudgeSearchTerm = useDebounce(judgeSearchTerm, 300);
    
    const matchesStatusFilter = (a: Assignment) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return a.status !== Status.FINALIZAT;
        return a.status === statusFilter;
    };

    const activeStages = useMemo(() => stages.filter(s => s.activ), [stages]);

    const assignmentCountsByJudge = useMemo(() => {
        const counts: Record<string, number> = {};
        judges.forEach(judge => {
            counts[judge.id] = assignments.filter(a => a.juratId === judge.id && a.etapaId === selectedStageId).length;
        });
        return counts;
    }, [assignments, judges, selectedStageId]);

    const assignmentCompletionByJudge = useMemo(() => {
        const counts: Record<string, number> = {};
        judges.forEach(judge => {
            counts[judge.id] = assignments.filter(a => a.juratId === judge.id && a.etapaId === selectedStageId && a.status === Status.FINALIZAT).length;
        });
        return counts;
    }, [assignments, judges, selectedStageId]);

    // Internal state management removed (viewMode, etc.) - now controlled by props


    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [resizingColumn, setResizingColumn] = useState<{ id: string; startX: number; startWidth: number } | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
    const [containerHeight, setContainerHeight] = useState(0);

    const ROW_HEIGHT = 68;
    const OVERSCAN = 5;

    const handlePromoteCandidate = (candidateId: string, nextStageId: string) => {
        setCandidates(prev => prev.map(c => {
            if (c.id !== candidateId) return c;
            
            const newPromotions = { ...(c.promotions || {}), [nextStageId]: true };
            
            // Add audit log
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Promovare Candidat',
                detalii: {
                    candidatId: c.id,
                    numeCandidat: c.nume,
                    motiv: `Promovat în etapa ${nextStageId}`
                }
            });

            return { ...c, promotions: newPromotions };
        }));
    };

    const handleDemoteCandidate = (candidateId: string, stageId: string) => {
         setCandidates(prev => prev.map(c => {
            if (c.id !== candidateId) return c;
            
            const newPromotions = { ...(c.promotions || {}) };
            delete newPromotions[stageId];
            
             // Add audit log
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Retrogradare Candidat',
                detalii: {
                    candidatId: c.id,
                    numeCandidat: c.nume,
                    motiv: `Retrogradat din etapa ${stageId}`
                }
            });

            return { ...c, promotions: newPromotions };
        }));
    }

    const assignmentMatrixItems = useMemo(() => {
        const items: { candidate: Candidat; category: Category }[] = [];
        
        // Filter candidates based on selectedStageId promotion status
        let visibleCandidates = candidates;
        if (selectedStageId && selectedStageId !== 'etapa1') {
             visibleCandidates = candidates.filter(c => c.promotions && c.promotions[selectedStageId]);
        }

        visibleCandidates.forEach(candidate => {
            candidate.categorieIds.forEach(catId => {
                const category = categories.find(c => c.id === catId);
                if (category) {
                    items.push({ candidate, category });
                }
            });
        });

        return items.filter(item =>
            item.candidate.nume.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            item.candidate.scoala.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [candidates, categories, debouncedSearchTerm, selectedStageId]);

    const uniqueFocusCandidates = useMemo(() => {
        const seen = new Set<string>();
        return assignmentMatrixItems.reduce((acc, item) => {
            if (!seen.has(item.candidate.id)) {
                seen.add(item.candidate.id);
                acc.push(item.candidate);
            }
            return acc;
        }, [] as Candidat[]);
    }, [assignmentMatrixItems]);
    
    const filteredJudges = useMemo(() => {
        return judges.filter(j => {
            const matchesSearch = j.nume.toLowerCase().includes(debouncedJudgeSearchTerm.toLowerCase());
            
            if (viewMode === 'matrix' && selectedStageId) {
                if (j.stages && !j.stages.includes(selectedStageId)) return false;
            }

            const hasStatus = assignments.some(a => 
                a.juratId === j.id && 
                a.etapaId === selectedStageId && 
                matchesStatusFilter(a)
            );

            return matchesSearch && (statusFilter === 'all' ? true : hasStatus);
        });
    }, [judges, debouncedJudgeSearchTerm, statusFilter, assignments, selectedStageId, viewMode]);

    useEffect(() => {
        setColumnWidths(prev => {
            const newWidths: Record<string, number> = { 
                candidate: prev.candidate || 320,
                averageScore: prev.averageScore || 120,
            };
            filteredJudges.forEach(j => {
                newWidths[j.id] = prev[j.id] || 140;
            });
            return newWidths;
        });
    }, [filteredJudges]);
    
    useEffect(() => {
        const currentRef = scrollContainerRef.current;
        if (!currentRef) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerHeight(entries[0].contentRect.height);
            }
        });
        
        resizeObserver.observe(currentRef);
        
        // Initial check
        if(currentRef.clientHeight > 0) {
            setContainerHeight(currentRef.clientHeight);
        }

        return () => resizeObserver.disconnect();
    }, [viewMode]); // Re-run only when view mode changes (mounting/unmounting the div)


    const handleMouseDown = useCallback((columnId: string, e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setResizingColumn({
            id: columnId,
            startX: e.clientX,
            startWidth: columnWidths[columnId],
        });
    }, [columnWidths]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingColumn) return;
            const dx = e.clientX - resizingColumn.startX;
            const newWidth = Math.max(100, resizingColumn.startWidth + dx);
            setColumnWidths(prev => ({ ...prev, [resizingColumn.id]: newWidth }));
        };
        const handleMouseUp = () => setResizingColumn(null);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingColumn]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollPosition({
            top: e.currentTarget.scrollTop,
            left: e.currentTarget.scrollLeft,
        });
    }, []);

    const judgeColumns = useMemo(() => {
        let currentOffset = 0;
        return filteredJudges
            .filter(j => !j.stages || j.stages.includes(selectedStageId)) // Filter by stage assignment
            .map(j => {
                const width = columnWidths[j.id] || 140;
                const col = { id: j.id, judge: j, width, offset: currentOffset };
                currentOffset += width;
                return col;
            });
    }, [filteredJudges, columnWidths, selectedStageId]);

    const matrixCandidateWidth = columnWidths.candidate || 300;
    const matrixAverageScoreWidth = columnWidths.averageScore || 80;
    
    const assignmentIndex = useMemo(() => {
        const map = new Map<string, Assignment>();
        for (const a of assignments) {
            if (a.etapaId !== selectedStageId) continue;
            map.set(`${selectedStageId}:${a.candidatId}:${a.categorieId}:${a.juratId}`, a);
        }
        return map;
    }, [assignments, selectedStageId]);

    const rowStatsIndex = useMemo(() => {
        const map = new Map<string, { assignedCount: number; finalizedCount: number; sumFinal: number }>();
        for (const a of assignments) {
            if (a.etapaId !== selectedStageId) continue;
            const key = `${a.candidatId}:${a.categorieId}`;
            const prev = map.get(key) ?? { assignedCount: 0, finalizedCount: 0, sumFinal: 0 };
            prev.assignedCount += 1;
            if (a.status === Status.FINALIZAT && typeof a.scorFinal === 'number') {
                prev.finalizedCount += 1;
                prev.sumFinal += a.scorFinal;
            }
            map.set(key, prev);
        }
        return map;
    }, [assignments, selectedStageId]);
    
    const totalTableWidth = useMemo(() => {
        const candidateWidth = matrixCandidateWidth;
        const averageScoreWidth = matrixAverageScoreWidth;
        const judgesWidth = judgeColumns.reduce((sum, col) => sum + col.width, 0);
        return candidateWidth + averageScoreWidth + judgesWidth;
    }, [judgeColumns, matrixAverageScoreWidth, matrixCandidateWidth]);

    const { virtualRows, paddingTop, paddingBottom } = useMemo(() => {
        if (assignmentMatrixItems.length === 0 || containerHeight === 0) {
            return { virtualRows: [], paddingTop: 0, paddingBottom: 0 };
        }
        
        const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
        const startIndex = Math.max(0, Math.floor(scrollPosition.top / ROW_HEIGHT) - OVERSCAN);
        const endIndex = Math.min(assignmentMatrixItems.length - 1, startIndex + visibleCount + OVERSCAN * 2);

        const rows = assignmentMatrixItems.slice(startIndex, endIndex + 1).map((item, i) => ({
            ...item,
            index: startIndex + i,
        }));
        
        return {
            virtualRows: rows,
            paddingTop: startIndex * ROW_HEIGHT,
            paddingBottom: (assignmentMatrixItems.length - (endIndex + 1)) * ROW_HEIGHT,
        };
    }, [scrollPosition.top, assignmentMatrixItems, ROW_HEIGHT, OVERSCAN, containerHeight]);
    
    const visibleJudgeColumnIds = useMemo(() => {
        const ids = new Set<string>();
        const containerWidth = scrollContainerRef.current?.clientWidth || 0;
        const candidateWidth = columnWidths.candidate || 320;
        const averageScoreWidth = columnWidths.averageScore || 120;
        const actionsWidth = 120;
        const stickyWidth = candidateWidth + averageScoreWidth + actionsWidth;
        const scrollLeft = scrollPosition.left;
        
        const renderBuffer = 300; 

        judgeColumns.forEach(col => {
            const colStart = col.offset + stickyWidth;
            const colEnd = colStart + col.width;
            if (colEnd > scrollLeft - renderBuffer && colStart < scrollLeft + containerWidth + renderBuffer) {
                ids.add(col.id);
            }
        });
        return ids;
    }, [scrollPosition.left, judgeColumns, columnWidths.candidate, columnWidths.averageScore, scrollContainerRef.current?.clientWidth]);

    const handleAssignmentChange = (candidatId: string, juratId: string, isAssigned: boolean, categoryId: string) => {
        const candidate = candidates.find(c => c.id === candidatId);
        const judge = judges.find(j => j.id === juratId);
        const stage = stages.find(s => s.id === selectedStageId);
        const category = categories.find(c => c.id === categoryId);

        if(isAssigned) {
            const existing = assignments.find(a => a.candidatId === candidatId && a.juratId === juratId && a.etapaId === selectedStageId && a.categorieId === categoryId);
            if (existing) return;

            const newAssignment: Assignment = {
                id: `a-${candidatId}-${juratId}-${selectedStageId}-${categoryId}-${Date.now()}`,
                candidatId,
                juratId,
                etapaId: selectedStageId,
                categorieId: categoryId,
                status: Status.NEINCEPUT,
                scoruri: {},
                observatii: {},
                lastModified: new Date()
            };
            setAssignments(prev => [...prev, newAssignment]);
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Creare Asignare',
                detalii: {
                    candidatId,
                    numeCandidat: candidate?.nume,
                    juratId,
                    numeJurat: judge?.nume,
                    etapaId: selectedStageId,
                    motiv: `Asignare manuală a juratului ${judge?.nume} pentru ${candidate?.nume} (Cat: ${category?.nume}) în etapa "${stage?.nume}".`
                }
            });
        } else {
            const assignmentToDelete = assignments.find(a => a.candidatId === candidatId && a.juratId === juratId && a.etapaId === selectedStageId && a.categorieId === categoryId);
            if (!assignmentToDelete) return;

            const deleteAssignment = () => {
                addAuditLog({
                    adminId: currentUser.id,
                    actiune: 'Ștergere Asignare',
                    detalii: {
                        candidatId,
                        numeCandidat: candidate?.nume,
                        juratId,
                        numeJurat: judge?.nume,
                        etapaId: selectedStageId,
                        statusVechi: assignmentToDelete.status,
                        motiv: `Ștergere manuală a asignării juratului ${judge?.nume} pentru ${candidate?.nume} (Cat: ${category?.nume}) în etapa "${stage?.nume}". Status anterior: "${assignmentToDelete.status}".`
                    }
                });
                setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
            };

            if (assignmentToDelete.status === Status.NEINCEPUT) {
                deleteAssignment();
            } else {
                const confirmationMessage = `Sunteți sigur că doriți să anulați asignarea? Această acțiune va șterge permanent evaluarea (status: ${assignmentToDelete.status}) făcută de ${judge?.nume} pentru ${candidate?.nume}. Doriți să continuați?`;

                if (window.confirm(confirmationMessage)) {
                    deleteAssignment();
                }
            }
        }
    };
    
    const handleAdminSaveAssignment = (updatedAssignment: Assignment, reason: string = '') => {
        const originalAssignment = assignments.find(a => a.id === updatedAssignment.id);
        if (!originalAssignment) return;
    
        const originalScores = originalAssignment.scoruri;
        const newScores = updatedAssignment.scoruri;
    
        const changes: { critId: string, oldScore: number|undefined, newScore: number }[] = [];
        Object.keys(newScores).forEach(critId => {
            const oldScore = originalScores[critId];
            const newScore = newScores[critId];
            if(oldScore !== newScore) {
                changes.push({critId, oldScore: oldScore ?? 0, newScore});
            }
        });

        Object.keys(originalScores).forEach(critId => {
            if(!(critId in newScores)) {
                changes.push({critId, oldScore: originalScores[critId], newScore: 0 });
            }
        });
    
        if (changes.length > 0 && (typeof reason !== 'string' || reason.trim() === '')) {
            alert("Vă rugăm să oferiți un motiv pentru modificarea scorurilor.");
            return;
        }
    
        changes.forEach(change => {
            addAuditLog({
                adminId: currentUser.id,
                actiune: 'Modificare Scor (Admin)',
                detalii: {
                    candidatId: updatedAssignment.candidatId,
                    numeCandidat: candidates.find(c => c.id === updatedAssignment.candidatId)?.nume,
                    juratId: updatedAssignment.juratId,
                    numeJurat: judges.find(j => j.id === updatedAssignment.juratId)?.nume,
                    etapaId: updatedAssignment.etapaId,
                    criteriuId: change.critId,
                    scorVechi: change.oldScore,
                    scorNou: change.newScore,
                    motiv: reason,
                }
            });
        });
    
        setAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
        setEditingAssignment(null);
    };

    const handleDownloadTemplate = () => {
        const headers = ['candidatId', 'numeCandidat', 'juratId'];
        const csvRows = [headers.join(',')];

        candidates.forEach(candidate => {
            const row = [candidate.id, `"${candidate.nume.replace(/"/g, '""')}"`, ''];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `template_asignari_${selectedStageId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportAssignments = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = text.split('\n').slice(1);

            const newAssignments: Assignment[] = [];
            const errors: string[] = [];
            const existingJudges = new Set(judges.map(j => j.id));
            const existingCandidates = new Set(candidates.map(c => c.id));

            rows.forEach((rowStr, index) => {
                if (typeof rowStr !== 'string' || rowStr.trim() === '') return;

                const [candidatId, _, juratId] = rowStr.split(',').map(s => s.trim().replace(/"/g, ''));

                if (!candidatId || !juratId) {
                    errors.push(`Rândul ${index + 2}: Lipsește ID-ul candidatului sau al juratului.`);
                    return;
                }
                if (!existingCandidates.has(candidatId)) {
                    errors.push(`Rândul ${index + 2}: ID candidat invalid: ${candidatId}.`);
                    return;
                }
                if (!existingJudges.has(juratId)) {
                    errors.push(`Rândul ${index + 2}: ID jurat invalid: ${juratId}.`);
                    return;
                }
                
                const candidate = candidates.find(c => c.id === candidatId);
                if (!candidate) return;

                candidate.categorieIds.forEach(catId => {
                    const alreadyExists = assignments.some(a =>
                        a.candidatId === candidatId &&
                        a.juratId === juratId &&
                        a.etapaId === selectedStageId &&
                        a.categorieId === catId
                    );

                    if (alreadyExists) return;

                    const judge = judges.find(j => j.id === juratId);
                    const stage = stages.find(s => s.id === selectedStageId);
                    const category = categories.find(c => c.id === catId);

                    const newAssignment: Assignment = {
                        id: `a-import-${candidatId}-${juratId}-${selectedStageId}-${catId}-${Date.now()}`,
                        candidatId,
                        juratId,
                        etapaId: selectedStageId,
                        categorieId: catId,
                        status: Status.NEINCEPUT,
                        scoruri: {},
                        observatii: {},
                        lastModified: new Date()
                    };
                    newAssignments.push(newAssignment);
                    
                    addAuditLog({
                        adminId: currentUser.id,
                        actiune: 'Import Asignare',
                        detalii: {
                            candidatId,
                            numeCandidat: candidate?.nume,
                            juratId,
                            numeJurat: judge?.nume,
                            etapaId: selectedStageId,
                            motiv: `Asignare creată prin import CSV pentru etapa "${stage?.nume}" (Cat: ${category?.nume}).`
                        }
                    });
                })
            });

            if (newAssignments.length > 0) {
                setAssignments(prev => [...prev, ...newAssignments]);
            }
            
            let summary = `${newAssignments.length} asignări noi au fost importate cu succes.`;
            if (errors.length > 0) {
                summary += `\n\nAu fost găsite ${errors.length} erori:\n- ${errors.slice(0, 5).join('\n- ')}`;
                if (errors.length > 5) summary += '\n... și altele.';
            }
            alert(summary);
            setIsImportModalOpen(false);
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Card className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-ave-blue">Asignări & Scoruri</h3>
                        <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex text-sm">
                            <button 
                                onClick={() => setViewMode('matrix')}
                                className={`px-3 py-1 rounded-md transition-all ${viewMode === 'matrix' ? 'bg-white dark:bg-slate-600 shadow text-ave-blue font-semibold' : 'text-gray-500 dark:text-slate-400'}`}
                            >
                                Matrice
                            </button>
                            <button 
                                onClick={() => setViewMode('focus')}
                                className={`px-3 py-1 rounded-md transition-all ${viewMode === 'focus' ? 'bg-white dark:bg-slate-600 shadow text-ave-blue font-semibold' : 'text-gray-500 dark:text-slate-400'}`}
                            >
                                Focus View
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                        <button 
                            onClick={() => setIsAddModalOpen(true)} 
                            className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg">
                            <PlusIcon className="w-4 h-4" />
                            <span>Asignare Nouă</span>
                        </button>
                        <button 
                            onClick={() => setIsImportModalOpen(true)} 
                            className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg">
                            <DownloadIcon className="w-4 h-4" />
                            <span>Import Asignări</span>
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-5 h-5" />
                                <input type="text" placeholder="Caută candidat..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"/>
                            </div>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-5 h-5" />
                                <input type="text" placeholder="Caută jurat..." value={judgeSearchTerm} onChange={e => setJudgeSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"/>
                            </div>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value as Status | 'all' | 'pending')} 
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            >
                                <option value="all">Toate Statusurile</option>
                                <option value="pending">Restante</option>
                                <option value={Status.NEINCEPUT}>Neînceput</option>
                                <option value={Status.IN_CURS}>În Curs</option>
                                <option value={Status.FINALIZAT}>Finalizat</option>
                            </select>
                            <select value={selectedStageId} onChange={e => setSelectedStageId(e.target.value)} className="pr-4 py-2 border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark]">
                                {activeStages.map(s => <option key={s.id} value={s.id}>{s.nume}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {viewMode === 'matrix' && (
                    <>
                <div className="md:hidden space-y-4 p-4">
                    {assignmentMatrixItems.map(({ candidate, category }) => {
                        const candidateAssignments = assignments.filter(a =>
                            a.candidatId === candidate.id &&
                            a.etapaId === selectedStageId &&
                            a.categorieId === category.id &&
                            matchesStatusFilter(a)
                        );
                        const finalizedAssignments = candidateAssignments.filter(a => a.status === Status.FINALIZAT && typeof a.scorFinal === 'number');
                        const averageScore = finalizedAssignments.length > 0
                            ? finalizedAssignments.reduce((acc, a) => acc + a.scorFinal!, 0) / finalizedAssignments.length
                            : null;
                        
                        return (
                            <div key={`${candidate.id}-${category.id}`} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-slate-100">{candidate.nume}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{candidate.scoala}</p>
                                            <p className="text-xs font-semibold text-ave-blue dark:text-blue-400 mt-1">{category.nume}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-bold text-xl text-ave-blue block">{averageScore !== null ? averageScore.toFixed(2) : '-'}</span>
                                        <span className="text-xs text-gray-500">medie</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 dark:border-slate-700 pt-3 mb-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Jurați Asignați</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidateAssignments.map(a => {
                                            const judge = judges.find(j => j.id === a.juratId);
                                            const statusColor = 
                                                a.status === Status.FINALIZAT ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300' :
                                                a.status === Status.IN_CURS ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-300';
                                            
                                            return (
                                                <div key={a.id} className={`text-xs px-2 py-1 rounded border ${statusColor} flex items-center gap-1 cursor-pointer`} onClick={() => setEditingAssignment(a)}>
                                                    <span className="font-semibold">{judge?.nume || 'Unknown'}</span>
                                                    {a.status === Status.FINALIZAT && <CheckBadgeIcon className="w-3 h-3" />}
                                                </div>
                                            );
                                        })}
                                        {candidateAssignments.length === 0 && <span className="text-xs text-gray-400 italic">Nicio asignare</span>}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                     <button onClick={() => setSummaryCandidate(candidate)} className="text-sm font-semibold text-ave-blue hover:underline">Vezi detalii &gt;</button>
                                </div>
                            </div>
                        );
                    })}
                     {assignmentMatrixItems.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-slate-400">Niciun candidat găsit.</div>
                    )}
                </div>
                </>
                )}

                {viewMode === 'focus' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[70vh]">
                        {/* Sidebar */}
                        <div className="md:col-span-3 border-r dark:border-slate-700 pr-4 flex flex-col h-full min-h-0">
                            <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                                <button onClick={() => { setFocusType('judge'); setSelectedFocusId(null); }} className={`flex-1 text-xs py-1 rounded ${focusType === 'judge' ? 'bg-white dark:bg-slate-600 shadow font-bold text-ave-blue' : 'text-gray-500'}`}>Jurați</button>
                                <button onClick={() => { setFocusType('candidate'); setSelectedFocusId(null); }} className={`flex-1 text-xs py-1 rounded ${focusType === 'candidate' ? 'bg-white dark:bg-slate-600 shadow font-bold text-ave-blue' : 'text-gray-500'}`}>Candidați</button>
                            </div>
                            
                            <div className="relative mb-4">
                                <SearchIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={focusType === 'judge' ? "Caută jurat..." : "Caută candidat..."}
                                    value={focusType === 'judge' ? judgeSearchTerm : searchTerm}
                                    onChange={e => focusType === 'judge' ? setJudgeSearchTerm(e.target.value) : setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md dark:bg-slate-700 dark:border-slate-600"
                                />
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-1 min-h-0 pr-1">
                                {focusType === 'judge' ? (
                                    filteredJudges.map(j => (
                                        <div 
                                            key={j.id} 
                                            onClick={() => setSelectedFocusId(j.id)}
                                            className={`p-2 rounded cursor-pointer text-sm flex justify-between items-center ${selectedFocusId === j.id ? 'bg-blue-50 dark:bg-slate-700 text-ave-blue font-semibold' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <span>{j.nume}</span>
                                            <span className="text-xs bg-gray-200 dark:bg-slate-600 px-1.5 rounded-full text-gray-600 dark:text-slate-300">
                                                {assignments.filter(a => a.juratId === j.id && a.etapaId === selectedStageId).length}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    assignmentMatrixItems.map(item => (
                                        <div 
                                            key={`${item.candidate.id}-${item.category.id}`} 
                                            onClick={() => setSelectedFocusId(`${item.candidate.id}|${item.category.id}`)}
                                            className={`p-2 rounded cursor-pointer text-sm flex flex-col items-start gap-0.5 ${selectedFocusId === `${item.candidate.id}|${item.category.id}` ? 'bg-blue-50 dark:bg-slate-700 text-ave-blue font-semibold' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <span className="truncate w-full">{item.candidate.nume}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-400 font-medium truncate w-full">{item.category.nume}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-9 overflow-y-auto h-full pl-2">
                            {!selectedFocusId ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <UserGroupIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Selectează un {focusType === 'judge' ? 'jurat' : 'candidat'} din listă pentru a vedea detaliile.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {focusType === 'judge' ? (
                                        (() => {
                                            const judgeAssignments = assignments.filter(a =>
                                                a.juratId === selectedFocusId &&
                                                a.etapaId === selectedStageId &&
                                                matchesStatusFilter(a)
                                            );
                                            return judgeAssignments.length > 0 ? judgeAssignments.map(a => {
                                                const candidate = candidates.find(c => c.id === a.candidatId);
                                                const category = categories.find(cat => cat.id === a.categorieId);
                                                if (!candidate) return null;
                                                return (
                                                    <div key={a.id} className="border dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm relative group">
                                                        <div className="absolute top-2 right-2">
                                                            <div className={`w-3 h-3 rounded-full ${a.status === Status.FINALIZAT ? 'bg-green-500' : a.status === Status.IN_CURS ? 'bg-yellow-500' : 'bg-gray-300'}`} title={a.status} />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-slate-100 pr-6">{candidate.nume}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{candidate.scoala}</p>
                                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded">{category?.nume}</span>
                                                        
                                                        <div className="mt-4 flex justify-between items-center pt-4 border-t dark:border-slate-700">
                                                            <div className="font-mono font-bold text-lg">
                                                                {a.scorFinal ? a.scorFinal : '-'}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setEditingAssignment(a)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded">Editează</button>
                                                                <button onClick={() => handleAssignmentChange(candidate.id, selectedFocusId, false, a.categorieId)} className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded">Șterge</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }) : <p className="text-gray-500 col-span-3 text-center py-10">Acest jurat nu are nicio asignare în această etapă.</p>;
                                        })()
                                    ) : (
                                        (() => {
                                            const [candId, catId] = selectedFocusId.includes('|') ? selectedFocusId.split('|') : [selectedFocusId, null];
                                            const candAssignments = assignments.filter(a => 
                                                a.candidatId === candId && 
                                                a.etapaId === selectedStageId && 
                                                (!catId || a.categorieId === catId) &&
                                                matchesStatusFilter(a)
                                            );
                                            
                                            return candAssignments.length > 0 ? candAssignments.map(a => {
                                                const judge = judges.find(j => j.id === a.juratId);
                                                const category = categories.find(cat => cat.id === a.categorieId);
                                                if (!judge) return null;
                                                return (
                                                    <div key={a.id} className="border dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm relative group">
                                                        <div className="absolute top-2 right-2">
                                                            <div className={`w-3 h-3 rounded-full ${a.status === Status.FINALIZAT ? 'bg-green-500' : a.status === Status.IN_CURS ? 'bg-yellow-500' : 'bg-gray-300'}`} title={a.status} />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-slate-100 pr-6">{judge.nume}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{judge.profesie}</p>
                                                        <span className="text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded">{category?.nume}</span>
                                                        
                                                        <div className="mt-4 flex justify-between items-center pt-4 border-t dark:border-slate-700">
                                                            <div className="font-mono font-bold text-lg">
                                                                {a.scorFinal ? a.scorFinal : '-'}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setEditingAssignment(a)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded">Editează</button>
                                                                <button onClick={() => handleAssignmentChange(candId, judge.id, false, a.categorieId)} className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded">Șterge</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }) : <p className="text-gray-500 col-span-3 text-center py-10">Acest candidat nu are jurati asignați pentru această categorie.</p>;
                                        })()
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'matrix' && (
                <div className="overflow-auto hidden md:block border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm" style={{ height: '70vh' }}>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between sticky top-0 z-50 gap-4">
                        <div className="flex items-center gap-4">
                            <h4 className="font-bold text-gray-700 dark:text-slate-200">Matrice Evaluare</h4>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Etapa: {stages.find(s => s.id === selectedStageId)?.nume || selectedStageId || '-'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-slate-500"></span>
                                <span>Neînceput</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                                <span>În curs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                <span>Finalizat</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse relative">
                        <thead className="sticky top-0 z-40 bg-gray-50/95 dark:bg-slate-700/95 backdrop-blur shadow-sm">
                            <tr>
                                <th className="py-3 px-4 text-left font-bold text-gray-700 dark:text-slate-200 sticky left-0 z-50 bg-gray-50 dark:bg-slate-700 border-b border-r dark:border-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[250px]" style={{ width: matrixCandidateWidth, minWidth: matrixCandidateWidth }}>
                                    Candidat / Categorie
                                </th>
                                <th className="py-3 px-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-b border-r dark:border-slate-600" style={{ width: matrixAverageScoreWidth, minWidth: matrixAverageScoreWidth }}>
                                    Medie / Progres
                                </th>
                                {judgeColumns.map(({ id, judge }) => (
                                    <th key={id} className="py-3 px-2 text-center font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600 min-w-[140px]">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="truncate max-w-[120px] font-bold text-ave-dark-blue dark:text-slate-200" title={judge.nume}>{judge.nume}</span>
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                                (assignmentCompletionByJudge[id] || 0) === (assignmentCountsByJudge[id] || 0) && (assignmentCountsByJudge[id] || 0) > 0
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                                                    : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-400'
                                            }`}>
                                                {assignmentCompletionByJudge[id] || 0}/{assignmentCountsByJudge[id] || 0}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {categories.map(category => {
                                const categoryItems = assignmentMatrixItems.filter(item => item.category.id === category.id);
                                if (categoryItems.length === 0) return null;

                                return (
                                    <React.Fragment key={category.id}>
                                        <tr className="bg-blue-50/50 dark:bg-slate-700/50">
                                            <td colSpan={filteredJudges.length + 2} className="py-2 px-4 font-bold text-ave-blue dark:text-blue-400 text-xs uppercase tracking-wider sticky left-0 z-30 bg-blue-50/95 dark:bg-slate-700/95 backdrop-blur-sm border-y dark:border-slate-600 shadow-sm">
                                                {category.nume}
                                            </td>
                                        </tr>
                                        {categoryItems.map(({ candidate }) => {
                                            const stats = rowStatsIndex.get(`${candidate.id}:${category.id}`);
                                            const assignedCount = stats?.assignedCount ?? 0;
                                            const finalizedCount = stats?.finalizedCount ?? 0;
                                            const averageScore = finalizedCount > 0 ? (stats!.sumFinal / finalizedCount) : null;
                                            const currentStageIndex = stages.findIndex(s => s.id === selectedStageId);
                                            const nextStage = currentStageIndex >= 0 ? stages[currentStageIndex + 1] : undefined;
                                            const isPromoted = nextStage ? !!candidate.promotions?.[nextStage.id] : false;

                                            return (
                                                <tr key={`${candidate.id}-${category.id}`} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="py-2 px-4 sticky left-0 z-20 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700/30 border-r dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="truncate flex-grow min-w-0">
                                                                <p className="font-bold text-gray-900 dark:text-slate-100 truncate">{candidate.nume}</p>
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{candidate.scoala}</p>
                                                            </div>
                                                            {nextStage ? (
                                                                <button
                                                                    onClick={() => isPromoted ? handleDemoteCandidate(candidate.id, nextStage.id) : handlePromoteCandidate(candidate.id, nextStage.id)}
                                                                    className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                                                        isPromoted
                                                                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                                                                    }`}
                                                                    title={isPromoted ? `Retrogradează din ${nextStage.nume}` : `Promovează în ${nextStage.nume}`}
                                                                >
                                                                    {isPromoted ? 'Promovat' : 'Promovează'}
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Final</span>
                                                            )}
                                                            <button onClick={() => setSummaryCandidate(candidate)} className="text-gray-300 hover:text-ave-blue flex-shrink-0 p-1 transition-colors">
                                                                <InformationCircleIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700/30 border-r dark:border-slate-700 text-center" style={{ width: matrixAverageScoreWidth, minWidth: matrixAverageScoreWidth }}>
                                                        <div className={`font-bold text-lg ${averageScore !== null ? 'text-ave-blue' : 'text-gray-300'}`}>
                                                            {averageScore !== null ? averageScore.toFixed(2) : '-'}
                                                        </div>
                                                        <div className={`mt-1 text-[11px] font-mono ${assignedCount > 0 ? 'text-gray-500 dark:text-slate-400' : 'text-gray-300'}`}>
                                                            {assignedCount > 0 ? `${finalizedCount}/${assignedCount}` : '-'}
                                                        </div>
                                                    </td>
                                                    {judgeColumns.map(({ id }) => {
                                                        const assignment = assignmentIndex.get(`${selectedStageId}:${candidate.id}:${category.id}:${id}`);
                                                        return (
                                                            <td key={id} className="p-1 text-center align-middle h-[50px]">
                                                                <AssignmentCell
                                                                    assignment={assignment}
                                                                    onDelete={() => handleAssignmentChange(candidate.id, id, false, category.id)}
                                                                    onAdd={() => handleAssignmentChange(candidate.id, id, true, category.id)}
                                                                    onEdit={() => assignment && setEditingAssignment(assignment)}
                                                                    onViewObservations={() => assignment && setViewingObservationsAssignment(assignment)}
                                                                    onViewAudit={() => assignment && setViewingAuditAssignment(assignment)}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {assignmentMatrixItems.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-slate-400">Niciun candidat găsit.</div>
                    )}
                </div>
                </div>
                )}
                
                {summaryCandidate && <CandidateSummaryModal 
                    candidate={summaryCandidate} 
                    onClose={() => setSummaryCandidate(null)}
                    assignments={assignments}
                    judges={judges}
                    stageId={selectedStageId}
                    categories={categories}
                />}

                {isAddModalOpen && <AddAssignmentModal {...props} onClose={() => setIsAddModalOpen(false)} />}
                
                {isBulkModalOpen && <BulkAssignmentModal {...props} onClose={() => setIsBulkModalOpen(false)} />}

                {isImportModalOpen && <AssignmentImportModal 
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImportAssignments}
                    onDownloadTemplate={handleDownloadTemplate}
                />}

                {editingAssignment && (
                    <ScoringPanel 
                        assignment={editingAssignment} 
                        candidate={candidates.find(c => c.id === editingAssignment.candidatId)!}
                        criteria={criteria}
                        allAssignments={assignments}
                        onClose={() => setEditingAssignment(null)}
                        onSave={handleAdminSaveAssignment}
                        isReadOnly={false}
                        isAdmin={true}
                    />
                )}

                {viewingObservationsAssignment && (
                    <ObservationsModal
                        assignment={viewingObservationsAssignment}
                        candidate={candidates.find(c => c.id === viewingObservationsAssignment.candidatId)!}
                        judge={judges.find(j => j.id === viewingObservationsAssignment.juratId)!}
                        criteria={criteria}
                        onClose={() => setViewingObservationsAssignment(null)}
                    />
                )}
                 {viewingAuditAssignment && (
                    <AssignmentAuditModal
                        assignment={viewingAuditAssignment}
                        onClose={() => setViewingAuditAssignment(null)}
                        auditLogs={auditLogs}
                        criteria={criteria}
                        candidate={candidates.find(c => c.id === viewingAuditAssignment.candidatId)!}
                        judge={judges.find(j => j.id === viewingAuditAssignment.juratId)!}
                    />
                )}
            </Card>
        </>
    );
};

const AssignmentImportModal: React.FC<{
    onClose: () => void;
    onImport: (file: File) => void;
    onDownloadTemplate: () => void;
}> = ({ onClose, onImport, onDownloadTemplate }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleImportClick = () => {
        if (file) {
            onImport(file);
        } else {
            alert("Vă rugăm selectați un fișier CSV.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">Import Asignări din CSV</h3>
                </header>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                        Selectați un fișier CSV pentru a adăuga asignări în masă pentru etapa curentă. Fișierul trebuie să conțină coloanele `candidatId` și `juratId`. Pentru candidații cu mai multe categorii, se va crea o asignare pentru fiecare categorie.
                    </p>
                    <button 
                        onClick={onDownloadTemplate} 
                        className="w-full flex items-center justify-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2.5 rounded-lg"
                    >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                        <span>Descarcă fișier template</span>
                    </button>
                    <div 
                        className="mt-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-ave-blue"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <DownloadIcon className="mx-auto h-10 w-10 text-gray-400 dark:text-slate-500" />
                        {file ? (
                            <p className="mt-2 text-sm font-semibold text-ave-blue">{file.name}</p>
                        ) : (
                             <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">Trageți fișierul aici sau click pentru a selecta</p>
                        )}
                    </div>
                </div>
                <footer className="p-5 border-t dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anulează</button>
                    <button type="button" onClick={handleImportClick} disabled={!file} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-ave-blue hover:bg-ave-dark-blue disabled:opacity-50 disabled:cursor-not-allowed">Importă Asignări</button>
                </footer>
            </div>
        </div>
    );
};


const AuditAndExport: React.FC<AdminViewProps> = (props) => {
    const { auditLogs } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [exportFilters, setExportFilters] = useState({
        stageId: 'all',
        categoryId: 'all',
        status: 'all'
    });

    const filteredLogs = useMemo(() => {
        if (!debouncedSearchTerm) return auditLogs;
        return auditLogs.filter(log =>
            log.actiune.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            log.detalii.numeCandidat?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            log.detalii.numeJurat?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            log.detalii.motiv.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            log.adminId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [auditLogs, debouncedSearchTerm]);

    const exportData = (data: any[], fileName: string) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${fileName}.json`;
        link.click();
    };

    const exportResultsToCsv = () => {
        const { candidates, assignments, categories } = props;

        const escapeCsvCell = (cellData: string | number | undefined) => {
            if (cellData === undefined || cellData === null) return '';
            const stringData = String(cellData);
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        const FINAL_STAGE_ID = 'etapa4';
        
        const stageAssignments = assignments.filter(a => a.etapaId === FINAL_STAGE_ID);

        const enhancedCandidates = candidates.flatMap(candidate => 
            candidate.categorieIds.map(catId => {
                const relevantAssignments = stageAssignments.filter(a => a.candidatId === candidate.id && a.categorieId === catId);
                const finalizatAssignments = relevantAssignments.filter(a => a.status === Status.FINALIZAT && a.scorFinal !== undefined);

                const scorMediu = finalizatAssignments.length > 0
                    ? finalizatAssignments.reduce((acc, a) => acc + (a.scorFinal || 0), 0) / finalizatAssignments.length
                    : null;
                
                return {
                    ...candidate,
                    categorieId: catId,
                    scorMediu,
                };
            })
        ).filter(c => c.scorMediu !== null);

        const candidatesByCategory = categories.map(category => ({
            ...category,
            candidates: enhancedCandidates
                .filter(c => c.categorieId === category.id)
                .sort((a, b) => (b.scorMediu ?? -1) - (a.scorMediu ?? -1)),
        })).filter(c => c.candidates.length > 0);

        const csvRows = ['Categorie,Rank Categorie,Nume Candidat,Scoala,Regiune,Scor Mediu Final'];
        
        candidatesByCategory.forEach(category => {
            category.candidates.forEach((candidate, index) => {
                const row = [
                    escapeCsvCell(category.nume),
                    index + 1,
                    escapeCsvCell(candidate.nume),
                    escapeCsvCell(candidate.scoala),
                    escapeCsvCell(candidate.regiune),
                    candidate.scorMediu?.toFixed(2) ?? 'N/A'
                ];
                csvRows.push(row.join(','));
            });
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "rezultate-finale-gala.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportAssignmentsToCsv = () => {
        const { assignments, candidates, judges, stages, categories, criteria } = props;
        
        const filteredAssignments = assignments.filter(a => {
            if (exportFilters.stageId !== 'all' && a.etapaId !== exportFilters.stageId) return false;
            if (exportFilters.categoryId !== 'all' && a.categorieId !== exportFilters.categoryId) return false;
            if (exportFilters.status !== 'all' && a.status !== exportFilters.status) return false;
            return true;
        });

        const escapeCsvCell = (cellData: string | number | undefined | null) => {
            if (cellData === undefined || cellData === null) return '';
            const stringData = String(cellData);
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        // Create headers for all defined criteria to ensure comprehensive export
        // We append the ID in parens to ensure uniqueness if names are duplicated
        const criterionHeaders = criteria.map(c => `${c.nume} (${c.id})`);

        const headers = [
            'ID Evaluare',
            'ID Candidat',
            'Nume Candidat', 
            'ID Jurat',
            'Nume Jurat',
            'Email Jurat',
            'Etapa',
            'Categorie',
            'Status',
            'Scor Final',
            ...criterionHeaders,
            'Last Modified'
        ];
        const csvRows = [headers.join(',')];

        filteredAssignments.forEach(a => {
            const cand = candidates.find(c => c.id === a.candidatId);
            const judge = judges.find(j => j.id === a.juratId);
            const stage = stages.find(s => s.id === a.etapaId);
            const category = categories.find(c => c.id === a.categorieId);

            const criterionScores = criteria.map(c => {
                const score = a.scoruri[c.id];
                return escapeCsvCell(typeof score === 'number' ? score : '');
            });

            const row = [
                escapeCsvCell(a.id),
                escapeCsvCell(a.candidatId),
                escapeCsvCell(cand?.nume),
                escapeCsvCell(a.juratId),
                escapeCsvCell(judge?.nume),
                escapeCsvCell(judge?.email),
                escapeCsvCell(stage?.nume || a.etapaId),
                escapeCsvCell(category?.nume || a.categorieId),
                escapeCsvCell(a.status),
                escapeCsvCell(typeof a.scorFinal === 'number' ? a.scorFinal.toFixed(2) : ''),
                ...criterionScores,
                escapeCsvCell(new Date(a.lastModified).toLocaleString('ro-RO'))
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `evaluari_${exportFilters.stageId}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportCandidatesToCsv = () => {
        const { candidates, categories } = props;

        const escapeCsvCell = (cellData: string | number | undefined | null) => {
            if (cellData === undefined || cellData === null) return '';
            const stringData = String(cellData);
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        const headers = ['ID', 'Nume', 'Titlu', 'Scoala', 'Localitate', 'Regiune', 'Categorii', 'Status Completare'];
        const csvRows = [headers.join(',')];

        candidates.forEach(candidate => {
            const categoryNames = candidate.categorieIds.map(id => categories.find(c => c.id === id)?.nume || id).join('; ');
            const localitate = candidate.extendedData?.localitateUnitate || '';
            const isComplete = !!candidate.extendedData?.acordRegulament;

            const row = [
                escapeCsvCell(candidate.id),
                escapeCsvCell(candidate.nume),
                escapeCsvCell(candidate.titlu),
                escapeCsvCell(candidate.scoala),
                escapeCsvCell(localitate),
                escapeCsvCell(candidate.regiune),
                escapeCsvCell(categoryNames),
                escapeCsvCell(isComplete ? 'Complet' : 'Incomplet')
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "lista-candidati.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getAdminName = (adminId: string) => {
        return ADMINI.find(a => a.id === adminId)?.nume || adminId;
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                 <div>
                     <h3 className="text-lg font-bold text-ave-blue">Jurnal de Audit & Export</h3>
                     <p className="text-sm text-gray-500 dark:text-slate-400">Urmăriți modificările și exportați datele competiției.</p>
                 </div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <button onClick={exportCandidatesToCsv} className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg"><UserGroupIcon className="w-4 h-4" /><span>Candidați (CSV)</span></button>
                    <button onClick={() => exportData(props.candidates, 'candidati')} className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg"><DownloadIcon className="w-4 h-4" /><span>Candidați (JSON)</span></button>
                    <button onClick={exportAssignmentsToCsv} className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg"><TableIcon className="w-4 h-4" /><span>Evaluări (CSV)</span></button>
                    <button onClick={() => exportData(props.assignments, 'evaluari')} className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg"><DownloadIcon className="w-4 h-4" /><span>Evaluări (JSON)</span></button>
                    <button onClick={() => exportData(auditLogs, 'jurnal_audit')} className="flex items-center space-x-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg"><ClipboardDocumentCheckIcon className="w-4 h-4" /><span>Jurnal (JSON)</span></button>
                    <button onClick={exportResultsToCsv} className="flex items-center space-x-2 text-sm font-semibold bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 px-3 py-1.5 rounded-lg"><TableIcon className="w-4 h-4" /><span>Rezultate (CSV)</span></button>
                </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg flex flex-wrap gap-3 items-center">
                <span className="text-xs font-bold uppercase text-gray-500 flex items-center">Filtre Export:</span>
                
                <select 
                    value={exportFilters.stageId}
                    onChange={e => setExportFilters(prev => ({ ...prev, stageId: e.target.value }))}
                    className="text-xs border-gray-300 rounded py-1 pl-2 pr-6 dark:bg-slate-700 dark:border-slate-600"
                >
                    <option value="all">Toate Etapele</option>
                    {props.stages.map(s => <option key={s.id} value={s.id}>{s.nume}</option>)}
                </select>

                <select 
                    value={exportFilters.categoryId}
                    onChange={e => setExportFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="text-xs border-gray-300 rounded py-1 pl-2 pr-6 dark:bg-slate-700 dark:border-slate-600"
                >
                    <option value="all">Toate Categoriile</option>
                    {props.categories.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                </select>

                <select 
                    value={exportFilters.status}
                    onChange={e => setExportFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="text-xs border-gray-300 rounded py-1 pl-2 pr-6 dark:bg-slate-700 dark:border-slate-600"
                >
                    <option value="all">Toate Statusurile</option>
                    <option value={Status.FINALIZAT}>Finalizat</option>
                    <option value={Status.IN_CURS}>În Curs</option>
                    <option value={Status.NEINCEPUT}>Neînceput</option>
                </select>
            </div>

             <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Caută în jurnal (acțiune, nume, motiv...)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"
                />
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <ul className="space-y-3">
                    {filteredLogs.map(log => (
                        <li key={log.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200">
                                        {log.actiune}
                                        <span className="font-normal text-gray-500 dark:text-slate-400"> de </span> 
                                        {getAdminName(log.adminId)}
                                    </p>
                                    <p className="mt-1 text-gray-600 dark:text-slate-300">{log.detalii.motiv}</p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">{log.timestamp.toLocaleString('ro-RO')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                {filteredLogs.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-slate-400">Nicio înregistrare găsită.</p>}
            </div>
        </Card>
    )
}

interface CandidateSummaryModalProps {
    candidate: Candidat;
    onClose: () => void;
    assignments: Assignment[];
    judges: Jurat[];
    stageId: string;
    categories: Category[];
}
const CandidateSummaryModal: React.FC<CandidateSummaryModalProps> = ({ candidate, onClose, assignments, judges, stageId, categories }) => {
    const relevantAssignments = useMemo(() => {
        return assignments.filter(a => a.candidatId === candidate.id && a.etapaId === stageId);
    }, [assignments, candidate.id, stageId]);

    const assignmentsWithDetails = useMemo(() => {
        return relevantAssignments.map(a => {
            const judge = judges.find(j => j.id === a.juratId);
            const category = categories.find(c => c.id === a.categorieId);
            return { ...a, judgeName: judge?.nume || 'N/A', categoryName: category?.nume || 'N/A' };
        }).sort((a,b) => a.categoryName.localeCompare(b.categoryName));
    }, [relevantAssignments, judges, categories]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-ave-dark-blue dark:text-slate-100">{candidate.nume}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{candidate.scoala}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">Regiune: {candidate.regiune}</p>
                    </div>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    <h4 className="font-semibold text-gray-700 dark:text-slate-200">Evaluări în etapa curentă</h4>
                    {assignmentsWithDetails.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                            {assignmentsWithDetails.map(a => (
                                <li key={a.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-slate-200">{a.judgeName}</p>
                                        <p className="text-xs font-semibold text-ave-blue dark:text-blue-400">{a.categoryName}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            a.status === Status.FINALIZAT ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                            a.status === Status.IN_CURS ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {a.status}
                                        </span>
                                        {a.status === Status.FINALIZAT && (
                                            <p className="font-bold text-lg text-ave-blue w-20 text-right">{a.scorFinal?.toFixed(2)}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-400 py-4">Nicio asignare pentru acest candidat în etapa selectată.</p>
                    )}
                </div>
                <footer className="p-4 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700">Închide</button>
                </footer>
            </div>
        </div>
    );
};

const AdminView: React.FC<AdminViewProps> = (props) => {
    const { stages, onNavigate } = props;
    const [activeTab, setActiveTab] = useState<AdminTab>('config');
    const [activeSubTab, setActiveSubTab] = useState<'structure' | 'candidates' | 'judges'>('structure');
    const [judgeSearch, setJudgeSearch] = useState('');
    
    // Lifted state for AssignmentManagement
    const [assignmentViewMode, setAssignmentViewMode] = useState<'matrix' | 'focus'>('focus');
    const activeStages = useMemo(() => stages.filter(s => s.activ), [stages]);
    const [assignmentStageId, setAssignmentStageId] = useState<string>(activeStages.find(s => s.id === 'etapa3')?.id || activeStages[0]?.id || '');
    const [assignmentFocusType, setAssignmentFocusType] = useState<'judge' | 'candidate'>('judge');
    const [assignmentFocusId, setAssignmentFocusId] = useState<string | null>(null);
    const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<Status | 'all' | 'pending'>('all');
    const [candidateCategoryFilter, setCandidateCategoryFilter] = useState<string>('all');

    // Ensure assignmentStageId is valid if stages change
    useEffect(() => {
        if (assignmentStageId && !activeStages.some(s => s.id === assignmentStageId)) {
            setAssignmentStageId(activeStages[0]?.id || '');
        }
        if (!assignmentStageId && activeStages.length > 0) {
            setAssignmentStageId(activeStages[0]?.id || '');
        }
    }, [activeStages, assignmentStageId]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard 
                    {...props} 
                    setActiveTab={setActiveTab}
                    setActiveSubTab={setActiveSubTab}
                    setJudgeSearch={setJudgeSearch}
                    setAssignmentViewMode={setAssignmentViewMode}
                    setAssignmentStageId={setAssignmentStageId}
                    setAssignmentFocusType={setAssignmentFocusType}
                    setAssignmentFocusId={setAssignmentFocusId}
                    setAssignmentStatusFilter={setAssignmentStatusFilter}
                    onNavigateToCategory={(catId) => {
                        setActiveTab('config');
                        setActiveSubTab('candidates');
                        setCandidateCategoryFilter(catId);
                    }}
                />;
            case 'config':
                return <ConfigManagement 
                    {...props} 
                    activeSubTab={activeSubTab}
                    setActiveSubTab={setActiveSubTab}
                    judgeSearch={judgeSearch}
                    setJudgeSearch={setJudgeSearch}
                    candidateCategoryFilter={candidateCategoryFilter}
                    setCandidateCategoryFilter={setCandidateCategoryFilter}
                />;
            case 'assignments':
                return <AssignmentManagement 
                    {...props} 
                    viewMode={assignmentViewMode}
                    setViewMode={setAssignmentViewMode}
                    selectedStageId={assignmentStageId}
                    setSelectedStageId={setAssignmentStageId}
                    focusType={assignmentFocusType}
                    setFocusType={setAssignmentFocusType}
                    selectedFocusId={assignmentFocusId}
                    setSelectedFocusId={setAssignmentFocusId}
                    statusFilter={assignmentStatusFilter}
                    setStatusFilter={setAssignmentStatusFilter}
                />;
            case 'audit':
                return <AuditAndExport {...props} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-ave-dark-blue dark:text-slate-100">Panou de Administrare</h2>
                {onNavigate && <HomeButton onNavigate={onNavigate} variant="icon" />}
            </div>
            <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Dashboard
                    </button>
                    <button onClick={() => setActiveTab('assignments')} className={`${activeTab === 'assignments' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Asignări & Scoruri
                    </button>
                    <button onClick={() => setActiveTab('config')} className={`${activeTab === 'config' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Configurare Competiție
                    </button>
                     <button onClick={() => setActiveTab('audit')} className={`${activeTab === 'audit' ? 'border-ave-blue text-ave-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Jurnal de Audit & Export
                    </button>
                </nav>
            </div>
            {renderTabContent()}
        </div>
    );
};


export default AdminView;
