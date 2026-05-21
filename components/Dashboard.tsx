import React, { useMemo } from 'react';
import { Candidat, Jurat, Assignment, Status, Category, Stage, AuditLog } from '../types';
import Card from './shared/Card';
import Donut from './shared/Donut';
import { ChartPieIcon, UserGroupIcon, ClipboardDocumentCheckIcon, CheckBadgeIcon, ClockIcon, ChevronRightIcon } from './shared/icons';
import { getRegions } from '../utils/regions';

interface DashboardProps {
  candidates: Candidat[];
  judges: Jurat[];
  assignments: Assignment[];
  stages: Stage[];
  categories: Category[];
  auditLogs: AuditLog[];
  setActiveTab: (tab: 'dashboard' | 'config' | 'assignments' | 'audit') => void;
  setActiveSubTab: (subTab: 'structure' | 'candidates' | 'judges') => void;
  setJudgeSearch: (search: string) => void;
  setAssignmentViewMode: (mode: 'matrix' | 'focus') => void;
  setAssignmentStageId: (id: string) => void;
  setAssignmentFocusType: (type: 'judge' | 'candidate') => void;
  setAssignmentFocusId: (id: string | null) => void;
  setAssignmentStatusFilter: (status: Status | 'all' | 'pending') => void;
  onNavigateToCategory?: (categoryId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    candidates, judges, assignments, stages, categories, auditLogs,
    setActiveTab, setActiveSubTab, setJudgeSearch,
    setAssignmentViewMode, setAssignmentStageId, setAssignmentFocusType, setAssignmentFocusId,
    setAssignmentStatusFilter, onNavigateToCategory
}) => {
  
  // --- Computed Statistics ---
  const totalCandidates = candidates.length;
  const totalJudges = judges.length;
  const totalAssignments = assignments.length;
  
  const completedAssignments = useMemo(() => 
    assignments.filter(a => a.status === Status.FINALIZAT).length, 
  [assignments]);

  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;

  const currentStage = stages.find(s => s.isCurrent) || stages.find(s => s.activ) || stages[0];
  const currentStageId = currentStage?.id || '';
  const REQUIRED_JUDGES_PER_CANDIDATE = 3;

  const candidatesWithoutEnoughAssignments = useMemo(() => {
    if (!currentStageId) return 0;
    const countByCandidate = new Map<string, number>();
    for (const a of assignments) {
      if (a.etapaId !== currentStageId) continue;
      countByCandidate.set(a.candidatId, (countByCandidate.get(a.candidatId) || 0) + 1);
    }
    let count = 0;
    for (const c of candidates) {
      const assigned = countByCandidate.get(c.id) || 0;
      if (assigned > 0 && assigned < REQUIRED_JUDGES_PER_CANDIDATE) count += 1;
    }
    return count;
  }, [assignments, candidates, currentStageId]);

  const judgesWithoutAssignmentsInStage = useMemo(() => {
    if (!currentStageId) return 0;
    const set = new Set(assignments.filter(a => a.etapaId === currentStageId).map(a => a.juratId));
    return judges.filter(j => !set.has(j.id)).length;
  }, [assignments, judges, currentStageId]);

  const avgTimeSinceFinalizationMs = useMemo(() => {
    if (!currentStageId) return null;
    const now = Date.now();
    const finalized = assignments.filter(a => a.etapaId === currentStageId && a.status === Status.FINALIZAT && a.lastModified instanceof Date);
    if (finalized.length === 0) return null;
    const totalMs = finalized.reduce((sum, a) => sum + (now - a.lastModified.getTime()), 0);
    return Math.round(totalMs / finalized.length);
  }, [assignments, currentStageId]);

  const assignmentsByStage = useMemo(() => {
    return stages.map(stage => {
        const stageAssignments = assignments.filter(a => a.etapaId === stage.id);
        const done = stageAssignments.filter(a => a.status === Status.FINALIZAT).length;
        const total = stageAssignments.length;
        
        // Count unique candidates in this stage (promoted or directly assigned)
        const uniqueCandidates = new Set(stageAssignments.map(a => a.candidatId)).size;

        return {
            id: stage.id,
            name: stage.nume,
            done,
            total,
            rate: total > 0 ? Math.round((done / total) * 100) : 0,
            candidateCount: uniqueCandidates
        };
    });
  }, [stages, assignments]);

  const judgesActivity = useMemo(() => {
      return judges.map(judge => {
          const judgeAssignments = assignments.filter(a => a.juratId === judge.id && (!currentStageId || a.etapaId === currentStageId));
          const done = judgeAssignments.filter(a => a.status === Status.FINALIZAT).length;
          const pending = judgeAssignments.length - done;
          return {
              ...judge,
              done,
              pending,
              total: judgeAssignments.length
          };
      }).sort((a, b) => b.pending - a.pending);
  }, [judges, assignments, currentStageId]);

  const laggingJudges = judgesActivity.filter(j => j.pending > 0).slice(0, 5);
  const topJudges = judgesActivity.filter(j => j.total > 0).sort((a, b) => b.done - a.done).slice(0, 5);

  const candidatesByCategory = useMemo(() => {
      return categories.map(cat => ({
          name: cat.nume,
          count: candidates.filter(c => c.categorieIds.includes(cat.id)).length
      }));
  }, [categories, candidates]);

  const categoryScores = useMemo(() => {
      return categories.map(cat => {
          const catAssignments = assignments.filter(a => a.categorieId === cat.id && a.status === Status.FINALIZAT && typeof a.scorFinal === 'number');
          const avg = catAssignments.length > 0
              ? catAssignments.reduce((sum, a) => sum + (a.scorFinal || 0), 0) / catAssignments.length
              : 0;
          return { name: cat.nume, avg };
      });
  }, [categories, assignments]);

  const recentActivity = auditLogs.slice(0, 5);

    const allRegions = getRegions();
  const REGIONS_TO_SHOW = allRegions.slice(0, 4);

  const registrationStats = useMemo(() => {
      const total = totalCandidates || 1; // avoid division by zero
      return REGIONS_TO_SHOW.map(region => {
          const count = candidates.filter(c => c.regiune === region).length;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return { region, count, percent };
      });
  }, [REGIONS_TO_SHOW.join('|'), candidates, totalCandidates]);

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}z ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };


  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div>
            <h3 className="text-3xl font-extrabold text-ave-dark-blue dark:text-slate-100">Panou de Control</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
                Bine ai venit în centrul de comandă al Galei Directorii Anului.
            </p>
            {currentStage && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-ave-blue"></span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Etapa curentă:</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{currentStage.nume}</span>
              </div>
            )}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700">
            <div className="relative w-10 h-10 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-blue-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-ave-blue transition-all duration-1000 ease-out" strokeDasharray={`${completionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <span className="absolute text-xs font-bold text-ave-blue">{completionRate}%</span>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Progres General</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{completedAssignments} / {totalAssignments} evaluări</p>
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
            title="Total Candidați" 
            value={totalCandidates} 
            icon={<UserGroupIcon className="w-6 h-6 text-white"/>} 
            color="bg-blue-500"
            onClick={() => { setActiveTab('config'); setActiveSubTab('candidates'); }}
        />
        <KPICard 
            title="Total Jurați" 
            value={totalJudges} 
            icon={<UserGroupIcon className="w-6 h-6 text-white"/>} 
            color="bg-purple-500"
            onClick={() => { setActiveTab('config'); setActiveSubTab('judges'); }}
        />
        <KPICard 
            title="Evaluări Finalizate" 
            value={completedAssignments} 
            icon={<CheckBadgeIcon className="w-6 h-6 text-white"/>} 
            color="bg-green-500"
            onClick={() => {
                setActiveTab('assignments');
                setAssignmentViewMode('focus');
                setAssignmentStatusFilter(Status.FINALIZAT);
            }}
        />
        <KPICard 
            title="În Așteptare" 
            value={totalAssignments - completedAssignments} 
            icon={<ClockIcon className="w-6 h-6 text-white"/>} 
            color="bg-amber-500"
            onClick={() => {
                setActiveTab('assignments');
                setAssignmentViewMode('focus');
                setAssignmentStatusFilter('pending');
            }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title={`Candidați sub ${REQUIRED_JUDGES_PER_CANDIDATE} asignări (etapa curentă)`}
          value={candidatesWithoutEnoughAssignments}
          icon={<ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />}
          color="bg-rose-500"
          onClick={() => {
            setActiveTab('assignments');
            setAssignmentViewMode('matrix');
            if (currentStageId) setAssignmentStageId(currentStageId);
            setAssignmentStatusFilter('pending');
          }}
        />
        <KPICard
          title="Jurați fără asignări (etapa curentă)"
          value={judgesWithoutAssignmentsInStage}
          icon={<UserGroupIcon className="w-6 h-6 text-white" />}
          color="bg-slate-500"
          onClick={() => {
            setActiveTab('assignments');
            setAssignmentViewMode('focus');
            if (currentStageId) setAssignmentStageId(currentStageId);
            setAssignmentFocusType('judge');
            setAssignmentStatusFilter('all');
          }}
        />
        <KPICard
          title="Timp mediu de la finalizare (etapa curentă)"
          value={avgTimeSinceFinalizationMs ? formatDuration(avgTimeSinceFinalizationMs) : '-'}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          color="bg-teal-500"
          onClick={() => {
            setActiveTab('assignments');
            setAssignmentViewMode('focus');
            if (currentStageId) setAssignmentStageId(currentStageId);
            setAssignmentStatusFilter(Status.FINALIZAT);
          }}
        />
      </div>

      {/* Statistici pe Regiuni */}
      <section>
          <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-ave-blue"/> Înscrieri pe Regiuni
          </h4>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {registrationStats.map((r, idx) => {
                      const color = '#3b82f6';
                      return (
                          <Card key={r.region} className="p-4 relative overflow-hidden bg-gradient-to-br from-blue-50/70 to-white dark:from-blue-900/10 dark:to-slate-800">
                              <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
                              <div className="flex items-center gap-4">
                                  <Donut percent={r.percent} size={84} strokeWidth={7} color={color} />
                                  <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-3">
                                          <div className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">{r.region}</div>
                                          <div className="text-xs font-black text-gray-700 dark:text-slate-200">{r.percent}%</div>
                                      </div>
                                      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/30 border border-blue-100/70 dark:border-blue-900/30 font-semibold">
                                              {r.count} înscrieri
                                          </span>
                                      </div>
                                      <div className="mt-3 w-full bg-white/70 dark:bg-slate-900/20 border border-blue-100/70 dark:border-blue-900/30 rounded-full h-2 overflow-hidden">
                                          <div className="h-full rounded-full" style={{ width: `${r.percent}%`, backgroundColor: color }}></div>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      );
                  })}
              </div>
          </div>
      </section>

      {/* Pipeline Visualization */}
      <section>
          <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-slate-100 flex items-center gap-2">
             <ClipboardDocumentCheckIcon className="w-5 h-5 text-ave-blue"/> Pipeline Jurizare
          </h4>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto">
              <div className="flex items-center w-full gap-4">
                  {assignmentsByStage.filter(s => s.id !== 'etapa_finala').map((stage, idx, arr) => {
                      const isActive = currentStageId === stage.id;
                      const isPast = arr.findIndex(s => s.id === currentStageId) > idx;
                      
                      return (
                          <React.Fragment key={stage.id}>
                              <div 
                                  onClick={() => { setActiveTab('assignments'); setAssignmentViewMode('matrix'); setAssignmentStageId(stage.id); }}
                                  className={`
                                      relative flex flex-col items-center justify-center p-4 rounded-xl min-w-[180px] flex-1 transition-all cursor-pointer border-2
                                      ${isActive ? 'border-ave-blue bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-md z-10' : 'border-transparent bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100'}
                                      ${isPast ? 'opacity-70' : ''}
                                  `}
                              >
                                  <div className={`
                                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3
                                      ${isActive ? 'bg-ave-blue text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-600'}
                                  `}>
                                      {idx + 1}
                                  </div>
                                  <h5 className="font-bold text-center text-sm text-gray-800 dark:text-slate-200 mb-1">{stage.name.split(' - ')[0]}</h5>
                                  <p className="text-xs text-gray-500 text-center mb-3 line-clamp-1">{stage.name.split(' - ')[1] || stage.name}</p>
                                  
                                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mb-2">
                                      <div className="bg-ave-blue h-1.5 rounded-full" style={{ width: `${stage.rate}%` }}></div>
                                  </div>
                                  <div className="flex justify-between w-full text-xs font-mono text-gray-500">
                                      <span>{stage.candidateCount} cand.</span>
                                      <span>{stage.rate}%</span>
                                  </div>
                              </div>
                              
                              {idx < arr.length - 1 && (
                                  <ChevronRightIcon className="w-6 h-6 text-gray-300 dark:text-slate-600 flex-shrink-0" />
                              )}
                          </React.Fragment>
                      );
                  })}
              </div>
          </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates per Category */}
        <Card className="p-6 lg:col-span-1">
            <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-slate-100">Distribuție Categorii</h4>
            <div className="space-y-4">
                {candidatesByCategory.map((cat, idx) => (
                    <div 
                        key={idx} 
                        className="group flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        onClick={() => {
                            const category = categories.find(c => c.nume === cat.name);
                            if (category && onNavigateToCategory) {
                                onNavigateToCategory(category.id);
                            } else {
                                setActiveTab('config');
                                setActiveSubTab('candidates');
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${['bg-blue-400', 'bg-purple-400', 'bg-pink-400'][idx % 3]}`}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-ave-blue transition-colors">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-md text-gray-800 dark:text-slate-200">{cat.count}</span>
                    </div>
                ))}
            </div>
        </Card>

        {/* Active Judges */}
        <Card className="p-6 lg:col-span-2">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-100">Top Jurați Activi</h4>
                <button onClick={() => setActiveTab('config')} className="text-xs font-semibold text-ave-blue hover:underline">Vezi toți</button>
             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topJudges.map((j, idx) => (
                    <div 
                        key={j.id} 
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow cursor-pointer bg-white dark:bg-slate-800"
                        onClick={() => {
                            setActiveTab('assignments');
                            setAssignmentViewMode('focus');
                            setAssignmentFocusType('judge');
                            setAssignmentFocusId(j.id);
                        }}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-500">
                            {j.nume.charAt(0)}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-sm text-gray-800 dark:text-slate-200 truncate">{j.nume}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">{j.done} finalizate</p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 text-xs font-bold">
                            #{idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>

       {laggingJudges.length > 0 && (
         <Card className="p-6 border-l-4 border-red-500">
            <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-red-500" /> Atenție: Evaluări Restante
            </h4>
            <div className="flex flex-wrap gap-3">
                 {laggingJudges.map(j => (
                     <div 
                        key={j.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-100"
                        onClick={() => {
                            setActiveTab('assignments');
                            setAssignmentViewMode('focus');
                            if (currentStageId) setAssignmentStageId(currentStageId);
                            setAssignmentFocusType('judge');
                            setAssignmentFocusId(j.id);
                            setAssignmentStatusFilter('pending');
                        }}
                     >
                         <span>{j.nume}</span>
                         <span className="bg-white/50 px-1.5 rounded text-xs font-bold">{j.pending}</span>
                     </div>
                 ))}
            </div>
         </Card>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-100">Activitate Recentă</h4>
                <button onClick={() => setActiveTab('audit')} className="text-xs font-semibold text-ave-blue hover:underline">Vezi tot</button>
            </div>
            <div className="space-y-0">
                {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400">Nicio activitate înregistrată.</p>
                ) : (
                    recentActivity.map((log, idx) => (
                        <div key={log.id} className={`flex flex-col py-3 ${idx !== recentActivity.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-800 dark:text-slate-200">{log.actiune}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{log.timestamp.toLocaleString('ro-RO')}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">{log.detalii.motiv || '-'}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Admin: {log.adminId}</span>
                        </div>
                    ))
                )}
            </div>
        </Card>

        {/* Score Distribution */}
        <Card className="p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-slate-100">Medie Scoruri pe Categorie</h4>
            <div className="space-y-4">
                {categoryScores.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-slate-300">
                            <span>{cat.name}</span>
                            <span>{cat.avg.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500'][idx % 3]}`} 
                                style={{ width: `${Math.min(100, (cat.avg / 30) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {categoryScores.every(c => c.avg === 0) && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">Nu există suficiente date pentru statistici.</p>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};

// --- Sub-components ---

const KPICard = ({ title, value, icon, color, onClick }: any) => (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl shadow-lg ${color}`}>
                {icon}
            </div>
        </div>
        <p className="text-3xl font-black text-gray-800 dark:text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">{title}</p>
    </div>
);

export default Dashboard;
