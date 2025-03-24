
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { ExerciseSet } from '@/lib/types';

interface ExerciseSetRowProps {
  set: ExerciseSet;
  setIndex: number;
  exerciseIndex: number;
  onWeightChange: (value: string) => void;
  onActualRepsChange: (value: string) => void;
  onSetCompletion: () => void;
  getCompletedButtonStyle: (completed: boolean) => React.CSSProperties;
  onRemoveSet?: () => void;
  isCompact?: boolean;
}

const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({
  set,
  setIndex,
  onWeightChange,
  onActualRepsChange,
  onSetCompletion,
  getCompletedButtonStyle,
  onRemoveSet,
  isCompact = false
}) => {
  // Ensure we have valid values with fallbacks
  const weight = set.weight !== undefined ? String(set.weight) : '';
  const targetReps = set.targetReps || 0;
  const actualReps = set.actualReps !== undefined ? String(set.actualReps) : '';
  const completed = Boolean(set.completed);

  const inputClasses = `w-full border rounded ${isCompact ? 'px-1 py-0.5 text-xs h-6' : 'px-2 py-1 text-sm h-8'}`;

  return (
    <div className="grid grid-cols-12 items-center gap-1 mb-1">
      <div className={`col-span-1 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>{setIndex + 1}</div>
      
      <div className="col-span-3">
        <input
          type="text"
          placeholder="lb/kg"
          className={inputClasses}
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className={`col-span-2 text-center ${isCompact ? 'text-xs' : 'text-sm'}`}>
        {targetReps}
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          className={inputClasses}
          value={actualReps}
          onChange={(e) => onActualRepsChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="col-span-3 flex justify-end space-x-1">
        <Button
          variant={completed ? "default" : "outline"}
          size="sm"
          className={`${isCompact ? 'w-5 h-5 px-0' : 'w-7 h-7 px-0'}`}
          onClick={(e) => {
            e.stopPropagation();
            onSetCompletion();
          }}
          style={getCompletedButtonStyle(completed)}
        >
          {completed ? (
            <Check className={isCompact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          ) : (
            <span className={isCompact ? "text-[8px]" : "text-xs"}>✓</span>
          )}
        </Button>
        
        {onRemoveSet && (
          <Button
            variant="ghost"
            size="sm"
            className={`${isCompact ? 'w-5 h-5' : 'w-7 h-7'} px-0 text-red-500 hover:text-red-700 hover:bg-red-50`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSet();
            }}
            title="Remove set"
          >
            <Trash2 className={isCompact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSetRow;
