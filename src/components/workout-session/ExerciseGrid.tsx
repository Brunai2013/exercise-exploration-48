
import React from 'react';
import { WorkoutExercise } from '@/lib/types';
import ExerciseWorkoutCard from '@/components/workout/ExerciseWorkoutCard';
import ExerciseGroupCard from '@/components/workout/ExerciseGroupCard';

interface ExerciseGroup {
  id: string;
  type: 'circuit';
  exerciseIds: string[];
}

interface ExerciseGridProps {
  workout: WorkoutExercise[];
  exerciseGroups: ExerciseGroup[];
  isExerciseInGroup: (exerciseId: string) => boolean;
  currentExerciseIndex: number;
  exerciseIndexMap: Record<string, number>;
  exerciseCategories: Record<string, {name: string, color: string}>;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onNavigateToExercise: (index: number) => void;
  removeFromGroup: (exerciseId: string) => void;
  selectedExercises: string[];
  groupingMode: boolean;
  toggleExerciseSelection: (exerciseId: string) => void;
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  workout,
  exerciseGroups,
  isExerciseInGroup,
  currentExerciseIndex,
  exerciseIndexMap,
  exerciseCategories,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onNavigateToExercise,
  removeFromGroup,
  selectedExercises,
  groupingMode,
  toggleExerciseSelection
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-8">
      {exerciseGroups.map(group => {
        const groupExercises = workout?.filter(ex => 
          group.exerciseIds.includes(ex.id)
        );
        
        if (!groupExercises || groupExercises.length < 2) return null;
        
        return (
          <ExerciseGroupCard
            key={group.id}
            groupType={group.type}
            exercises={groupExercises}
            currentExerciseIndex={currentExerciseIndex}
            exerciseIndexMap={exerciseIndexMap}
            exerciseCategories={exerciseCategories}
            onSetCompletion={onSetCompletion}
            onWeightChange={onWeightChange}
            onActualRepsChange={onActualRepsChange}
            onNavigateToExercise={onNavigateToExercise}
            onRemoveFromGroup={removeFromGroup}
          />
        );
      })}
      
      {workout?.map((exerciseItem, exerciseIndex) => {
        if (isExerciseInGroup(exerciseItem.id)) return null;
        
        return (
          <ExerciseWorkoutCard
            key={exerciseItem.id}
            exerciseItem={exerciseItem}
            exerciseIndex={exerciseIndex}
            currentExerciseIndex={currentExerciseIndex}
            onSetCompletion={onSetCompletion}
            onWeightChange={onWeightChange}
            onActualRepsChange={onActualRepsChange}
            onNavigateToExercise={onNavigateToExercise}
            exerciseCategories={exerciseCategories}
            isCompact={false}
            isSelected={selectedExercises.includes(exerciseItem.id)}
            onSelect={groupingMode ? () => toggleExerciseSelection(exerciseItem.id) : undefined}
          />
        );
      })}
    </div>
  );
};

export default ExerciseGrid;
