import React from 'react';
import { Candidat, Category, Assignment, Status } from '../../types';
import Card from './Card';
import { CheckBadgeIcon, ClockIcon, PencilSquareIcon } from './icons';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

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

    const statusConfig = isCompleted
        ? { variant: 'success' as const, label: 'Finalizat', Icon: CheckBadgeIcon }
        : isInProgress
          ? { variant: 'warning' as const, label: 'În curs', Icon: ClockIcon }
          : { variant: 'neutral' as const, label: 'Neînceput', Icon: PencilSquareIcon };

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
                <Badge variant={statusConfig.variant} icon={<statusConfig.Icon className="w-3.5 h-3.5" />}>
                    {statusConfig.label}
                </Badge>
            </div>

            <div className="mb-4 flex-grow">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <Badge variant="info" className="min-w-0 max-w-full break-words whitespace-normal">{category.nume}</Badge>
                    {isCompleted && typeof assignment.scorFinal === 'number' ? (
                        <Badge variant="brand">Scor {assignment.scorFinal.toFixed(2)}</Badge>
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
                <Button
                    onClick={(e) => { e.stopPropagation(); onEvaluate(); }}
                    variant={isCompleted ? 'secondary' : 'primary'}
                    className={isCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : ''}
                >
                    {isCompleted ? 'Editează' : 'Evaluează'}
                </Button>
                <Button
                    onClick={(e) => { e.stopPropagation(); onViewSubmission(); }}
                    variant="secondary"
                >
                    Vezi lucrarea
                </Button>
            </div>
        </Card>
    );
};

export default CandidateCard;
