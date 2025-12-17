import React, { useState, useMemo, useEffect } from 'react';
import { Candidat, Assignment, Stage, Category, Criterion, Jurat, Status, User, UserRole } from '../types';
import Card from './shared/Card';
import { TrophyIcon, CrownIcon, CheckBadgeIcon, ChevronUpDownIcon } from './shared/icons';
import FinalRankingsView from './FinalRankingsView';

type LeaderboardViewProps = {
    candidates: Candidat[];
    assignments: Assignment[];
    stages: Stage[];
    categories: Category[];
    criteria: Criterion[];
    judges: Jurat[];
    currentUser: User;
    setCandidates: React.Dispatch<React.SetStateAction<Candidat[]>>;
};

type EnhancedLeaderboardEntry = Candidat & {
    scorMediu: number | null;
    evaluariFinalizate: number;
    totalAsignari: number;
    scoruriPerCriteriu: Record<string, number | null>;
    evaluatedCategoryId: string;
};

const LeaderboardView: React.FC<LeaderboardViewProps> = (props) => {
    const { currentUser, setCandidates, assignments } = props;
    
    const activeStages = useMemo(() => props.stages.filter(s => s.activ), [props.stages]);
    const lastActiveStageId = useMemo(() => activeStages.length > 0 ? activeStages[activeStages.length - 1].id : (props.stages[0]?.id || ''), [activeStages, props.stages]);

    const [selectedStageId, setSelectedStageId] = useState<string>(lastActiveStageId);
    const [selectedCandidate, setSelectedCandidate] = useState<EnhancedLeaderboardEntry | null>(null);
    const isAdmin = currentUser.rol === UserRole.ADMIN;
    const directorOfTheYear = useMemo(() => props.candidates.find(c => c.isWinner), [props.candidates]);

    useEffect(() => {
        setSelectedStageId(lastActiveStageId);
    }, [lastActiveStageId]);

    const handlePromoteCandidate = (candidateId: string, fromStageId: string) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, promotions: { ...(c.promotions || {}), [fromStageId]: true } } : c));
    };

    const handleSetWinner = (candidateId: string, winnerCategoryId: string) => {
        if (!window.confirm("Sunteți sigur că doriți să desemnați acest candidat drept Directorul Anului?")) return;
        setCandidates(prev => prev.map(c => ({
            ...c,
            isWinner: c.id === candidateId,
            winningCategoryId: c.id === candidateId ? winnerCategoryId : c.winningCategoryId
        })));
    };

    const visibleCandidates = useMemo(() => {
        const stageIndex = props.stages.findIndex(s => s.id === selectedStageId);
        if (stageIndex < 0) return [];
        
        if (props.stages[stageIndex].id === 'etapa5') return props.candidates.filter(c => c.promotions?.['etapa4']);
        if (stageIndex <= 2) return props.candidates;
        
        const prevStageId = props.stages[stageIndex - 1]?.id;
        return prevStageId ? props.candidates.filter(c => c.promotions?.[prevStageId]) : props.candidates;
    }, [props.candidates, selectedStageId, props.stages]);

    const enhancedEntries = useMemo((): EnhancedLeaderboardEntry[] => {
        const entries: EnhancedLeaderboardEntry[] = [];
        const isFinala = selectedStageId === 'etapa5';
        const stageForCalc = isFinala ? 'etapa4' : selectedStageId;

        visibleCandidates.forEach(candidate => {
            const targetCategories = isFinala ? candidate.categorieIds : candidate.categorieIds; // Logic can be refined if finalists have specific categories
            
            targetCategories.forEach(catId => {
                const stageAssignments = props.assignments.filter(a =>
                    a.etapaId === stageForCalc &&
                    a.candidatId === candidate.id &&
                    a.categorieId === catId
                );
                
                const finalizatAssignments = stageAssignments.filter(a => a.status === 'Finalizat' && a.scorFinal !== undefined);
                
                // Calculate average of SUMS (since scorFinal is now a SUM)
                const scorMediu = finalizatAssignments.length > 0
                    ? finalizatAssignments.reduce((acc, a) => acc + (a.scorFinal!), 0) / finalizatAssignments.length
                    : null;
                
                const relevantCriteria = props.criteria.filter(c => c.etapaId === stageForCalc && c.categorieId === catId);
                const scoruriPerCriteriu: Record<string, number | null> = {};
                relevantCriteria.forEach(crit => {
                    const scoresForCrit = finalizatAssignments.map(a => a.scoruri[crit.id]).filter(s => s !== undefined) as number[];
                    scoruriPerCriteriu[crit.id] = scoresForCrit.length > 0 ? scoresForCrit.reduce((a, b) => a + b, 0) / scoresForCrit.length : null;
                });
                
                // For Finala, we pick the best category performance if multiple exist (usually 1 for finals)
                if (isFinala) {
                    // Simple dedup logic: check if we already have this candidate
                    const existing = entries.find(e => e.id === candidate.id);
                    if (!existing || (scorMediu ?? -1) > (existing.scorMediu ?? -1)) {
                         if (existing) entries.splice(entries.indexOf(existing), 1);
                         entries.push({
                            ...candidate,
                            evaluatedCategoryId: catId,
                            scorMediu,
                            evaluariFinalizate: finalizatAssignments.length,
                            totalAsignari: stageAssignments.length,
                            scoruriPerCriteriu,
                        });
                    }
                } else {
                     entries.push({
                        ...candidate,
                        evaluatedCategoryId: catId,
                        scorMediu,
                        evaluariFinalizate: finalizatAssignments.length,
                        totalAsignari: stageAssignments.length,
                        scoruriPerCriteriu,
                    });
                }
            });
        });
        
        return entries.sort((a, b) => (b.scorMediu ?? -1) - (a.scorMediu ?? -1));
    }, [visibleCandidates, props.assignments, selectedStageId, props.criteria]);

    const candidatesByCategory = useMemo(() => {
        return props.categories.map(category => ({
            ...category,
            candidates: enhancedEntries.filter(c => c.evaluatedCategoryId === category.id)
        })).filter(c => c.candidates.length > 0);
    }, [props.categories, enhancedEntries]);

    const relevantCriteria = useMemo(() => {
        const categoryIdsInView = new Set(enhancedEntries.map(c => c.evaluatedCategoryId));
        return props.criteria.filter(c => c.etapaId === selectedStageId && categoryIdsInView.has(c.categorieId));
    }, [props.criteria, selectedStageId, enhancedEntries]);

    const renderContent = () => {
        if (selectedStageId === 'etapa5') {
             return <WinnerSelectionView candidates={enhancedEntries} onSetWinner={handleSetWinner} isAdmin={isAdmin} directorOfTheYear={directorOfTheYear} categories={props.categories}/>;
        }
        if (selectedStageId === 'etapa_finala') {
             return <FinalRankingsView categoryWinners={props.candidates.filter(c => c.promotions?.['etapa4'])} directorOfTheYear={directorOfTheYear} categories={props.categories} assignments={assignments}/>;
        }

        if (candidatesByCategory.length === 0) {
            return <Card className="p-12 text-center text-gray-500">Nu există date pentru această etapă.</Card>;
        }

        return (
            <div className="space-y-16">
                {candidatesByCategory.map(category => {
                    const categoryCriteria = relevantCriteria.filter(c => c.categorieId === category.id);
                    const topCandidates = category.candidates.slice(0, 3);

                    return (
                        <div key={category.id} className="relative">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-2 bg-ave-blue rounded-full"></div>
                                <h3 className="text-2xl font-bold text-ave-dark-blue dark:text-slate-100">{category.nume}</h3>
                             </div>

                            {/* Podium Section */}
                            {category.candidates.length >= 3 && (
                                <div className="mb-12">
                                    <Podium candidates={topCandidates} />
                                </div>
                            )}

                            <TableView 
                                candidates={category.candidates} 
                                categories={props.categories} 
                                relevantCriteria={categoryCriteria} 
                                onRowClick={setSelectedCandidate}
                                isAdmin={isAdmin}
                                onPromote={handlePromoteCandidate}
                                selectedStageId={selectedStageId}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
             <header>
                <h2 className="text-3xl font-extrabold text-ave-dark-blue dark:text-slate-100 flex items-center gap-3">
                    <TrophyIcon className="w-10 h-10 text-ave-gold"/>
                    Clasament & Rezultate
                </h2>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-lg">Urmărește performanța candidaților în timp real.</p>
            </header>

            {/* Stage Selector Pills */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl w-fit">
                {activeStages.map(stage => (
                    <button 
                        key={stage.id} 
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${selectedStageId === stage.id ? 'bg-white dark:bg-slate-700 text-ave-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    >
                        {stage.nume}
                    </button>
                ))}
            </div>

            {renderContent()}

            {selectedCandidate && (
                <CandidateDetailModal 
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    assignments={props.assignments}
                    judges={props.judges}
                    criteria={props.criteria}
                    stageId={selectedStageId}
                    categories={props.categories}
                />
            )}
        </div>
    );
};

// --- Sub-components ---

const Podium: React.FC<{ candidates: EnhancedLeaderboardEntry[] }> = ({ candidates }) => {
    // Expects sorted candidates: 0 is 1st, 1 is 2nd, 2 is 3rd
    const [first, second, third] = candidates;
    
    const PodiumStep = ({ candidate, place, color, height }: { candidate: EnhancedLeaderboardEntry | undefined, place: number, color: string, height: string }) => {
        if (!candidate) return <div className="w-1/3"></div>;
        return (
            <div className="flex flex-col items-center justify-end w-1/3 z-10 relative group cursor-default">
                <div className={`relative mb-4 transition-transform duration-300 group-hover:-translate-y-2 flex flex-col items-center`}>
                    <div className={`w-8 h-8 rounded-full ${color.replace('border-', 'bg-')} text-white flex items-center justify-center font-bold shadow-md mb-2`}>
                        {place}
                    </div>
                </div>
                
                <div className="text-center mb-2 px-2">
                    <p className="font-bold text-gray-800 dark:text-white line-clamp-1">{candidate.nume}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{candidate.scoala}</p>
                    <p className="text-lg font-mono font-bold text-ave-blue mt-1">{candidate.scorMediu?.toFixed(2)}</p>
                </div>

                <div className={`w-full ${height} ${color.replace('border-', 'bg-').replace('-500', '-100')} dark:bg-opacity-20 rounded-t-2xl flex items-end justify-center pb-4 opacity-80`}>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center max-w-2xl mx-auto h-80 px-4">
            <PodiumStep candidate={second} place={2} color="border-gray-400" height="h-32" />
            <PodiumStep candidate={first} place={1} color="border-yellow-400" height="h-44" />
            <PodiumStep candidate={third} place={3} color="border-orange-400" height="h-24" />
        </div>
    );
};

const TableView: React.FC<any> = ({ candidates, categories, relevantCriteria, onRowClick, isAdmin, onPromote, selectedStageId }) => {
    return (
        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-gray-200 dark:ring-slate-700">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16 text-center">Loc</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Candidat</th>
                            {relevantCriteria.map((c: any) => (
                                <th key={c.id} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-32 hidden md:table-cell">
                                    {c.nume.split(' ').slice(0, 2).join(' ')}...
                                </th>
                            ))}
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-24">Scor</th>
                            {isAdmin && <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Acțiuni</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {candidates.map((candidate: any, idx: number) => (
                            <tr 
                                key={candidate.id} 
                                onClick={() => onRowClick(candidate)}
                                className="group hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                            >
                                <td className="p-4 text-center">
                                    <span className={`
                                        inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-ave-blue transition-colors">{candidate.nume}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{candidate.scoala}</p>
                                        </div>
                                    </div>
                                </td>
                                {relevantCriteria.map((c: any) => {
                                    const score = candidate.scoruriPerCriteriu[c.id];
                                    const max = c.scorMax || 10;
                                    const percent = score ? (score / max) * 100 : 0;
                                    return (
                                        <td key={c.id} className="p-4 text-center hidden md:table-cell">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-mono font-semibold text-gray-600 dark:text-slate-300">{score?.toFixed(1) || '-'}</span>
                                                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-ave-blue/60" style={{ width: `${percent}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="p-4 text-center">
                                    <span className="text-lg font-black text-ave-blue">{candidate.scorMediu?.toFixed(2) || '0.00'}</span>
                                </td>
                                {isAdmin && (
                                    <td className="p-4 text-center">
                                         {candidate.promotions?.[selectedStageId] ? (
                                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Promovat</span>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onPromote(candidate.id, selectedStageId); }}
                                                className="text-xs font-bold text-ave-blue hover:underline disabled:opacity-50"
                                                disabled={idx > 2} // Example restriction
                                            >
                                                Promovează
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const WinnerSelectionView: React.FC<any> = ({ candidates, onSetWinner, isAdmin, directorOfTheYear }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidates.map((c: any) => (
                <Card key={c.id} className={`p-6 text-center border-2 ${directorOfTheYear?.id === c.id ? 'border-ave-gold bg-amber-50' : 'border-transparent'}`}>
                    <h3 className="text-xl font-bold">{c.nume}</h3>
                    <p className="text-gray-500 mb-4">{c.scoala}</p>
                    {isAdmin && !directorOfTheYear && (
                        <button onClick={() => onSetWinner(c.id, c.evaluatedCategoryId)} className="w-full py-2 bg-ave-gold text-white font-bold rounded-lg hover:bg-amber-500">
                            Alege Directorul Anului
                        </button>
                    )}
                    {directorOfTheYear?.id === c.id && <div className="text-ave-gold font-black text-lg flex items-center justify-center gap-2"><CrownIcon className="w-6 h-6"/> CÂȘTIGĂTOR</div>}
                </Card>
            ))}
        </div>
    );
}

// Keeping existing CandidateDetailModal but ensuring it imports correctly if needed. 
// For brevity, assuming it's similar to previous implementation but we can simplify imports/exports.
const CandidateDetailModal: React.FC<any> = ({ candidate, onClose, assignments, judges, criteria, stageId, categories }) => {
    // Simplified Detail View
     const relevantCriteria = criteria.filter((c: any) => c.etapaId === stageId && c.categorieId === candidate.evaluatedCategoryId);
     
     return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-ave-dark-blue p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-bold">{candidate.nume}</h3>
                            <p className="text-white/80">{candidate.scoala}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-6 right-6 text-right">
                        <p className="text-xs uppercase tracking-wider opacity-70">Scor Final</p>
                        <p className="text-4xl font-black">{candidate.scorMediu?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {relevantCriteria.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="font-medium text-gray-700 dark:text-slate-200">{c.nume}</span>
                            <span className="font-bold text-ave-blue">{candidate.scoruriPerCriteriu[c.id]?.toFixed(2) || '-'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     );
}

export default LeaderboardView;