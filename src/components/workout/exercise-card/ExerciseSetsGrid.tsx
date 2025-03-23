
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ExerciseSet } from '@/lib/types';
import ExerciseSetRow from './ExerciseSetRow';

interface ExerciseSetsGridProps {
  exerciseSets: ExerciseSet[];
  exerciseIndex: number;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  categoryColor: string;
}

const ExerciseSetsGrid: React.FC<ExerciseSetsGridProps> = ({
  exerciseSets,
  exerciseIndex,
  onWeightChange,
  onActualRepsChange,
  onSetCompletion,
  categoryColor
}) => {
  // Safely extract color from category for set completion buttons
  const getCompletedButtonStyle = (completed: boolean) => {
    if (!completed) return {};
    
    // Only apply custom style if it's not a Tailwind class
    const colorValue = categoryColor.startsWith('bg-') ? '' : categoryColor;
    if (!colorValue) return {};
    
    return { backgroundColor: colorValue };
  };
  
  return (
    <>
      {/* Sets grid - column headers */}
      <div className="grid grid-cols-12 text-xs font-medium mb-1 gap-1">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Weight</div>
        <div className="col-span-2 text-center">Reps</div>
        <div className="col-span-3">Actual</div>
        <div className="col-span-3 text-right">Done</div>
      </div>
      
      {/* Individual sets */}
      {exerciseSets.length > 0 ? (
        exerciseSets.map((set, setIndex) => (
          <ExerciseSetRow
            key={set.id}
            set={set}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            onWeightChange={(value) => onWeightChange(exerciseIndex, setIndex, value)}
            onActualRepsChange={(value) => onActualRepsChange(exerciseIndex, setIndex, value)}
            onSetCompletion={() => onSetCompletion(exerciseIndex, setIndex, !set.completed)}
            getCompletedButtonStyle={getCompletedButtonStyle}
          />
        ))
      ) : (
        <div className="text-sm text-muted-foreground py-2">
          No sets defined for this exercise
        </div>
      )}
    </>
  );
};

export default ExerciseSetsGrid;
