
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
  isInGroupCard?: boolean;
}

const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({
  set,
  setIndex,
  onWeightChange,
  onActualRepsChange,
  onSetCompletion,
  getCompletedButtonStyle,
  onRemoveSet,
  isCompact = false,
  isInGroupCard = false
}) => {
  // Handle empty values with empty strings instead of showing "null"
  const weight = set.weight ? String(set.weight) : '';
  const targetReps = set.targetReps || 0;
  const actualReps = set.actualReps ? String(set.actualReps) : '';
  const completed = Boolean(set.completed);

  // Apply different styling based on compact mode
  const inputClasses = isInGroupCard 
    ? 'w-full border rounded px-1 py-0.5 text-xs h-6' 
    : `w-full border rounded ${isCompact ? 'px-1 py-0.5 text-xs h-6' : 'px-2 py-1 text-sm h-8'}`;
  
  const fontSizeClass = isInGroupCard ? 'text-xs' : (isCompact ? 'text-xs' : 'text-sm');
  const buttonSizeClass = isInGroupCard ? 'w-4 h-4 p-0' : (isCompact ? 'w-5 h-5 p-0' : 'w-7 h-7 p-0');
  const iconSizeClass = isInGroupCard ? 'h-2 w-2' : (isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3');

  // For group card view, use an ultra-compact layout
  if (isInGroupCard) {
    return (
      <div className="flex items-center gap-1 mb-0.5 text-xs">
        <div className="w-4 font-medium">{setIndex + 1}</div>
        <input
          type="text"
          placeholder="lb/kg"
          className="w-14 border rounded px-1 py-0 text-xs h-5"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="w-6 text-center">{targetReps}</div>
        <input
          type="text"
          placeholder={String(targetReps)}
          className="w-12 border rounded px-1 py-0 text-xs h-5"
          value={actualReps}
          onChange={(e) => onActualRepsChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-1">
          <Button
            variant={completed ? "default" : "outline"}
            size="sm"
            className={`w-4 h-4 p-0 min-w-0`}
            onClick={(e) => {
              e.stopPropagation();
              onSetCompletion();
            }}
            style={getCompletedButtonStyle(completed)}
          >
            {completed ? <Check className="h-2 w-2" /> : ""}
          </Button>
          
          {onRemoveSet && (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 min-w-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSet();
              }}
              title="Remove set"
            >
              <Trash2 className="h-2 w-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Regular layout
  return (
    <div className={`grid grid-cols-12 items-center gap-1 mb-1`}>
      <div className={`col-span-1 font-medium ${fontSizeClass}`}>{setIndex + 1}</div>
      
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
      
      <div className={`col-span-2 text-center ${fontSizeClass}`}>
        {targetReps}
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          placeholder={String(targetReps)}
          className={inputClasses}
          value={actualReps}
          onChange={(e) => onActualRepsChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="col-span-3 flex justify-end items-center space-x-1">
        <Button
          variant={completed ? "default" : "outline"}
          size="sm"
          className={buttonSizeClass}
          onClick={(e) => {
            e.stopPropagation();
            onSetCompletion();
          }}
          style={getCompletedButtonStyle(completed)}
        >
          {completed ? (
            <Check className={iconSizeClass} />
          ) : (
            <span className={isCompact ? "text-[8px]" : "text-xs"}>✓</span>
          )}
        </Button>
        
        {onRemoveSet && (
          <Button
            variant="ghost"
            size="sm"
            className={`${buttonSizeClass} text-red-500 hover:text-red-700 hover:bg-red-50`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSet();
            }}
            title="Remove set"
          >
            <Trash2 className={iconSizeClass} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSetRow;
