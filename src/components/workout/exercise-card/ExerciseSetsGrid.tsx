
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
  isInGroupCard?: boolean;
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
  isCompact = false,
  isInGroupCard = false
}) => {
  // Add debugging logs for exerciseSets
  useEffect(() => {
    console.log("ExerciseSetsGrid rendering:", {
      setCount: exerciseSets?.length || 0,
      exerciseIndex,
      sets: exerciseSets,
      hasAddSet: !!onAddSet,
      hasRemoveSet: !!onRemoveSet,
      isCompact,
      isInGroupCard
    });
  }, [exerciseSets, exerciseIndex, onAddSet, onRemoveSet, isCompact, isInGroupCard]);
  
  // Safely extract color from category for set completion buttons
  const getCompletedButtonStyle = (completed: boolean) => {
    if (!completed) return {};
    
    // Only apply custom style if it's not a Tailwind class
    const colorValue = categoryColor.startsWith('bg-') ? '' : categoryColor;
    if (!colorValue) return {};
    
    return { backgroundColor: colorValue };
  };
  
  // Special ultra-compact design for grouped cards
  if (isInGroupCard) {
    return (
      <div className="exercise-sets-grid text-xs">
        {/* Header Row */}
        <div className="flex items-center gap-1 mb-0.5 font-medium text-xs">
          <div className="w-4">#</div>
          <div className="w-14">Weight</div>
          <div className="w-6 text-center">Reps</div>
          <div className="w-12">Actual</div>
          <div>Done</div>
        </div>
        
        {/* Sets */}
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
              isInGroupCard={true}
            />
          ))
        ) : (
          <div className="text-xs text-muted-foreground py-1">No sets defined</div>
        )}
        
        {/* Add Set button */}
        {onAddSet && (
          <div className="mt-0.5">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-dashed text-xs py-0 h-5"
              onClick={() => {
                console.log("Add set button clicked, calling handler with exerciseIndex:", exerciseIndex);
                onAddSet(exerciseIndex);
              }}
            >
              <Plus className="h-2 w-2 mr-1" />
              Add Set
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Regular layout
  const headerFontSize = isCompact ? 'text-xs' : 'text-sm';
  const gridGap = isCompact ? 'gap-1' : 'gap-2';
  
  return (
    <div className={`exercise-sets-grid ${isCompact ? 'text-xs' : ''}`}>
      {/* Sets grid - column headers */}
      <div className={`grid grid-cols-12 font-medium mb-1 ${gridGap} ${headerFontSize}`}>
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
        <div className="mt-1">
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full border-dashed ${isCompact ? 'text-xs py-0.5 h-6' : 'text-sm py-1'}`}
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
