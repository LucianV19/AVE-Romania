import React, { useState, useMemo, useEffect } from 'react';
import { Candidat, Jurat, Assignment, Status, Criterion, Category, Stage, View } from '../types';
import { getRegions } from '../utils/regions';
import Card from './shared/Card';
import { SearchIcon, SlidersIcon, UserGroupIcon } from './shared/icons';
import ScoringPanel from './shared/ScoringPanel';
import CandidateEvaluationModal from './shared/CandidateEvaluationModal';
import CandidateCard from './shared/CandidateCard';
import HomeButton from './shared/HomeButton';

interface JudgeViewProps {
  candidates: Candidat[];
  assignments: Assignment[];
  criteria: Criterion[];
  categories: Category[];
  stages?: Stage[];
  currentJudge: Jurat;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  isAnonymized?: boolean;
  onNavigate?: (view: View) => void;
}

const JudgeView: React.FC<JudgeViewProps> = ({ candidates, assignments, criteria, categories, stages, currentJudge, setAssignments, isAnonymized = false, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [selectedAsignmentId, setSelectedAsignmentId] = useState<string | null>(null);
  const [evaluationAssignmentId, setEvaluationAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAsignmentId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAsignmentId]);

  // Determine active stage - prioritize "isCurrent: true", otherwise fallback to the stage of the first assignment
  const activeStage = useMemo(() => {
      const current = stages?.find(s => s.isCurrent);
      if (current) return current;
      
      const active = stages?.find(s => s.activ);
      if (active) return active;
      
      // Fallback: Try to guess from assignments
      if (assignments.length > 0) {
          const stageId = assignments[0].etapaId;
          return stages?.find(s => s.id === stageId);
      }
      return undefined;
  }, [stages, assignments]);

  const myAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.juratId === currentJudge.id && 
      (!activeStage || a.etapaId === activeStage.id)
    );
  }, [assignments, currentJudge, activeStage]);

  const filteredAssignments = useMemo(() => {
    return myAssignments
      .filter(a => {
        const candidate = candidates.find(c => c.id === a.candidatId);
        if (!candidate) return false;
        
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesRegion = regionFilter === 'all' || candidate.regiune === regionFilter;
        const matchesCategory = categoryFilter === 'all' || a.categorieId === categoryFilter;
        const matchesSearch =
          candidate.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.scoala.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesRegion && matchesCategory && matchesSearch;
      });
  }, [myAssignments, statusFilter, regionFilter, categoryFilter, searchTerm, candidates]);

  const hasAssignmentsForStage = myAssignments.length > 0;

  const openScoringPanel = (assignmentId: string) => {
    setSelectedAsignmentId(assignmentId);
  };

  const closeScoringPanel = () => {
    setSelectedAsignmentId(null);
  };
  
  const selectedAssignment = useMemo(() => {
      return assignments.find(a => a.id === selectedAsignmentId);
  }, [selectedAsignmentId, assignments]);

  const selectedEvaluation = useMemo(() => {
    if (!evaluationAssignmentId) return undefined;
    const a = assignments.find(x => x.id === evaluationAssignmentId);
    if (!a) return undefined;
    const c = candidates.find(cc => cc.id === a.candidatId);
    const cat = categories.find(ct => ct.id === a.categorieId);
    return { a, c: c!, cat };
  }, [evaluationAssignmentId, assignments, candidates, categories]);

  const handleSaveAssignment = (updatedAssignment: Assignment) => {
    setAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
  };


  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex justify-between items-center flex-wrap gap-y-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ave-dark-blue dark:text-slate-100">Portal Jurizare</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
            <p className="text-gray-500 dark:text-slate-400">Bine ai venit, {currentJudge.nume}.</p>
            {activeStage && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    Etapa: {activeStage.nume}
                </span>
            )}
          </div>
        </div>
        {onNavigate && (
          <div className="flex items-center gap-2">
            <HomeButton onNavigate={onNavigate} variant="icon" />
          </div>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Caută candidat sau școală..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative w-full">
              <SlidersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-6 h-6" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-xl appearance-none focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                <option value="all">Toate statusurile</option>
                <option value={Status.NEINCEPUT}>Neînceput</option>
                <option value={Status.IN_CURS}>În curs</option>
                <option value={Status.FINALIZAT}>Finalizat</option>
              </select>
            </div>
            <div className="relative w-full">
              <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-6 h-6" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-xl appearance-none focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                <option value="all">Toate categoriile</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nume}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full">
              <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-6 h-6" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as string | 'all')}
                className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-xl appearance-none focus:ring-ave-blue focus:border-ave-blue dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                <option value="all">Toate regiunile</option>
                {getRegions().map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {hasAssignmentsForStage && filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map(assignment => {
            const candidate = candidates.find(c => c.id === assignment.candidatId);
            const category = categories.find(cat => cat.id === assignment.categorieId);
            if (!candidate || !category) return null;

            return (
              <CandidateCard
                key={assignment.id}
                candidate={candidate}
                category={category}
                assignment={assignment}
                onEvaluate={() => openScoringPanel(assignment.id)}
                onViewSubmission={() => setEvaluationAssignmentId(assignment.id)}
                isAnonymized={isAnonymized}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          {!hasAssignmentsForStage ? (
            <p className="text-gray-500 dark:text-slate-400">
              {activeStage ? `Nu ai asignări pentru etapa curentă: ${activeStage.nume}.` : 'Nu ai asignări disponibile.'}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-slate-400">
              Nu au fost găsiți candidați care să corespundă filtrelor selectate.
            </p>
          )}
        </div>
      )}

      {selectedAssignment && (
        <ScoringPanel 
            assignment={selectedAssignment} 
            candidate={candidates.find(c => c.id === selectedAssignment.candidatId)!}
            criteria={criteria}
            allAssignments={assignments}
            onClose={closeScoringPanel}
            onSave={handleSaveAssignment}
            isReadOnly={selectedAssignment.status === Status.FINALIZAT}
        />
      )}

      {selectedEvaluation && (
        <CandidateEvaluationModal
          open={!!evaluationAssignmentId}
          candidate={selectedEvaluation.c}
          assignment={selectedEvaluation.a}
          category={selectedEvaluation.cat}
          currentJudge={currentJudge}
          criteria={criteria}
          onClose={() => setEvaluationAssignmentId(null)}
          onUpdateAssignment={(updated) => {
            setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
          }}
          isAnonymized={isAnonymized}
        />
      )}
    </div>
  );
};

export default JudgeView;
