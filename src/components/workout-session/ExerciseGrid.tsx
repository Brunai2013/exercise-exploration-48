
import React, { useEffect } from 'react';
import { WorkoutExercise } from '@/lib/types';
import ExerciseWorkoutCard from '@/components/workout/exercise-card';
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
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
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
  toggleExerciseSelection,
  onAddSet,
  onRemoveSet
}) => {
  // Add debugging logs to trace workout data and handlers
  useEffect(() => {
    console.log("ExerciseGrid rendering with:", {
      workoutExercisesCount: workout?.length || 0,
      exerciseGroupsCount: exerciseGroups?.length || 0,
      hasAddSetHandler: !!onAddSet,
      hasRemoveSetHandler: !!onRemoveSet,
      exercises: workout?.map(ex => ({
        name: ex.exercise.name,
        id: ex.id,
        setsCount: ex.sets?.length || 0
      }))
    });
  }, [workout, exerciseGroups, onAddSet, onRemoveSet]);

  return (
    <div className="grid grid-cols-1 gap-4 mb-8">
      {exerciseGroups.map(group => {
        const groupExercises = workout?.filter(ex => 
          group.exerciseIds.includes(ex.id)
        );
        
        console.log("Group exercises:", {
          groupId: group.id,
          exerciseCount: groupExercises?.length || 0,
          exercises: groupExercises?.map(ex => ({
            name: ex.exercise.name,
            id: ex.id,
            setsCount: ex.sets?.length || 0
          }))
        });
        
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
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
          />
        );
      })}
      
      {workout?.map((exerciseItem, exerciseIndex) => {
        if (isExerciseInGroup(exerciseItem.id)) return null;
        
        console.log("Rendering individual exercise:", {
          name: exerciseItem.exercise.name,
          id: exerciseItem.id,
          setsCount: exerciseItem.sets?.length || 0
        });
        
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
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
          />
        );
      })}
    </div>
  );
};

export default ExerciseGrid;
