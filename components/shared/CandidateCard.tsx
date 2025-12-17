import React from 'react';
import { Candidat, Category, Assignment, Status } from '../../types';
import Card from './Card';
import { CheckBadgeIcon, ClockIcon } from './icons';

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

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
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
                <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${isCompleted ? 'bg-green-500' : isInProgress ? 'bg-yellow-500' : 'bg-gray-300'}
                `} title={assignment.status} />
            </div>

            <div className="mb-4 flex-grow">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md mb-2">
                    {category.nume}
                </span>
                
                {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mt-1">
                        <CheckBadgeIcon className="w-4 h-4" />
                        <span>Evaluat: {assignment.scorFinal?.toFixed(2)}</span>
                    </div>
                )}
                {isInProgress && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium mt-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>În curs de evaluare</span>
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