
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ExerciseSet } from '@/lib/types';
import ExerciseSetRow from './ExerciseSetRow';

interface ExerciseSetsGridProps {
  exerciseSets: ExerciseSet[];
  exerciseIndex: number;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  categoryColor: string;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  isCompact?: boolean;
}

const ExerciseSetsGrid: React.FC<ExerciseSetsGridProps> = ({
  exerciseSets,
  exerciseIndex,
  onWeightChange,
  onActualRepsChange,
  onSetCompletion,
  categoryColor,
  onAddSet,
  onRemoveSet,
  isCompact = false
}) => {
  // Add debugging logs for exerciseSets
  useEffect(() => {
    console.log("ExerciseSetsGrid rendering:", {
      setCount: exerciseSets?.length || 0,
      exerciseIndex,
      sets: exerciseSets,
      hasAddSet: !!onAddSet,
      hasRemoveSet: !!onRemoveSet,
      isCompact
    });
  }, [exerciseSets, exerciseIndex, onAddSet, onRemoveSet, isCompact]);
  
  // Safely extract color from category for set completion buttons
  const getCompletedButtonStyle = (completed: boolean) => {
    if (!completed) return {};
    
    // Only apply custom style if it's not a Tailwind class
    const colorValue = categoryColor.startsWith('bg-') ? '' : categoryColor;
    if (!colorValue) return {};
    
    return { backgroundColor: colorValue };
  };
  
  return (
    <div className={`exercise-sets-grid ${isCompact ? 'text-xs' : ''}`}>
      {/* Sets grid - column headers */}
      <div className={`grid grid-cols-12 text-xs font-medium mb-1 gap-1 ${isCompact ? 'text-[10px]' : ''}`}>
        <div className="col-span-1">#</div>
        <div className="col-span-3">Weight</div>
        <div className="col-span-2 text-center">Reps</div>
        <div className="col-span-3">Actual</div>
        <div className="col-span-3 text-right">Done</div>
      </div>
      
      {/* Individual sets */}
      {exerciseSets && exerciseSets.length > 0 ? (
        exerciseSets.map((set, setIndex) => (
          <ExerciseSetRow
            key={set.id || `set-${setIndex}`}
            set={set}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            onWeightChange={(value) => onWeightChange(exerciseIndex, setIndex, value)}
            onActualRepsChange={(value) => onActualRepsChange(exerciseIndex, setIndex, value)}
            onSetCompletion={() => onSetCompletion(exerciseIndex, setIndex, !set.completed)}
            getCompletedButtonStyle={getCompletedButtonStyle}
            onRemoveSet={onRemoveSet ? () => onRemoveSet(exerciseIndex, setIndex) : undefined}
            isCompact={isCompact}
          />
        ))
      ) : (
        <div className="text-sm text-muted-foreground py-2">
          No sets defined for this exercise
        </div>
      )}

      {/* Add Set button */}
      {onAddSet && (
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full border-dashed ${isCompact ? 'text-xs py-1 h-7' : ''}`}
            onClick={() => {
              console.log("Add set button clicked, calling handler with exerciseIndex:", exerciseIndex);
              onAddSet(exerciseIndex);
            }}
          >
            <Plus className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
            Add Set
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseSetsGrid;
