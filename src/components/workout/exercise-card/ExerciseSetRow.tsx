
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
}

const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({
  set,
  setIndex,
  onWeightChange,
  onActualRepsChange,
  onSetCompletion,
  getCompletedButtonStyle,
  onRemoveSet
}) => {
  return (
    <div className="grid grid-cols-12 items-center gap-1 mb-1">
      <div className="col-span-1 font-medium text-xs">{setIndex + 1}</div>
      
      <div className="col-span-3">
        <input
          type="text"
          placeholder="lb/kg"
          className="w-full border rounded px-2 py-1 text-xs"
          value={set.weight !== undefined ? String(set.weight) : ''}
          onChange={(e) => onWeightChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="col-span-2 text-center text-xs">
        {set.targetReps}
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          className="w-full border rounded px-2 py-1 text-xs"
          value={set.actualReps !== undefined ? String(set.actualReps) : ''}
          onChange={(e) => onActualRepsChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="col-span-3 flex justify-end space-x-1">
        <Button
          variant={set.completed ? "default" : "outline"}
          size="sm"
          className="w-8 h-7 px-0"
          onClick={(e) => {
            e.stopPropagation();
            onSetCompletion();
          }}
          style={getCompletedButtonStyle(set.completed)}
        >
          {set.completed ? (
            <Check className="h-3 w-3" />
          ) : (
            <span className="text-xs">✓</span>
          )}
        </Button>
        
        {onRemoveSet && (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-7 px-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSet();
            }}
            title="Remove set"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSetRow;
