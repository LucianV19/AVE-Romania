import React from 'react';
import { Candidat, Category, Assignment, Status } from '../../types';
import Card from './Card';
import { CheckBadgeIcon, ClockIcon, PencilSquareIcon } from './icons';

interface CandidateCardProps {
    candidate: Candidat;
    category: Category;
    assignment: Assignment;
    onEvaluate: () => void;
    onViewSubmission: () => void;
    isAnonymized?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
    candidate, 
    category, 
    assignment, 
    onEvaluate, 
    onViewSubmission, 
    isAnonymized = false 
}) => {
    const isCompleted = assignment.status === Status.FINALIZAT;
    const isInProgress = assignment.status === Status.IN_CURS;
    const isNotStarted = assignment.status === Status.NEINCEPUT;

    const statusBadge = isCompleted
        ? {
              className:
                  'bg-green-50 text-green-700 border border-green-200/70 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/70',
              label: 'Finalizat',
              Icon: CheckBadgeIcon,
          }
        : isInProgress
          ? {
                className:
                    'bg-yellow-50 text-yellow-800 border border-yellow-200/70 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-900/70',
                label: 'În curs',
                Icon: ClockIcon,
            }
          : {
                className:
                    'bg-gray-100 text-gray-700 border border-gray-200/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600',
                label: 'Neînceput',
                Icon: PencilSquareIcon,
            };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                    <div>
                        <h3 className="font-bold text-lg text-ave-dark-blue dark:text-slate-100 line-clamp-1" title={candidate.nume}>
                            {isAnonymized ? `Candidat ${candidate.id}` : candidate.nume}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1" title={candidate.scoala}>
                            {candidate.scoala}
                        </p>
                    </div>
                </div>
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-5 whitespace-nowrap shrink-0 ${statusBadge.className}`}
                    title={assignment.status}
                >
                    <statusBadge.Icon className="w-3.5 h-3.5" />
                    <span>{statusBadge.label}</span>
                </span>
            </div>

            <div className="mb-4 flex-grow">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                        {category.nume}
                    </span>
                    {isCompleted && typeof assignment.scorFinal === 'number' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-ave-blue/10 text-ave-blue dark:bg-ave-blue/20 dark:text-blue-200 whitespace-nowrap">
                            Scor {assignment.scorFinal.toFixed(2)}
                        </span>
                    ) : null}
                </div>
                
                {isInProgress && (
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm font-medium mt-1">
                        <ClockIcon className="w-4 h-4 opacity-90" />
                        <span>În curs de evaluare</span>
                    </div>
                )}
                {isNotStarted && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm font-medium mt-1">
                        <PencilSquareIcon className="w-4 h-4 opacity-90" />
                        <span>Neînceput</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                    onClick={(e) => { e.stopPropagation(); onEvaluate(); }}
                    className={`
                        px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center
                        ${isCompleted 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40' 
                            : 'bg-ave-blue text-white hover:bg-ave-dark-blue'
                        }
                    `}
                >
                    {isCompleted ? 'Editează' : 'Evaluează'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewSubmission(); }}
                    className="px-3 py-2 text-sm font-semibold bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-gray-700 dark:text-slate-200 transition-colors"
                >
                    Vezi lucrarea
                </button>
            </div>
        </Card>
    );
};

export default CandidateCard;
