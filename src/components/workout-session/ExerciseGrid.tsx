
import React, { useEffect } from 'react';
import { WorkoutExercise } from '@/lib/types';
import ExerciseWorkoutCard from '@/components/workout/exercise-card';
import ExerciseGroupCard from '@/components/workout/ExerciseGroupCard';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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

  // Filter out exercises that are not in a group
  const individualExercises = workout?.filter(ex => !isExerciseInGroup(ex.id)) || [];
  
  // Split the individual exercises into pairs for two-column layout (on desktop only)
  const getExercisePairs = () => {
    if (isMobile) {
      return individualExercises.map(ex => [ex]);
    }
    
    const pairs = [];
    for (let i = 0; i < individualExercises.length; i += 2) {
      pairs.push(individualExercises.slice(i, i + 2));
    }
    return pairs;
  };
  
  const exercisePairs = getExercisePairs();

  return (
    <div className="mb-8">
      {/* Display exercise groups using the ExerciseGroupCard component */}
      {exerciseGroups.length > 0 && (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-4`}>
          {exerciseGroups.map(group => {
            const groupExercises = workout?.filter(ex => 
              group.exerciseIds.includes(ex.id)
            ) || [];
            
            if (groupExercises.length < 2) return null;
            
            return (
              <ExerciseGroupCard
                key={group.id}
                groupType="circuit"
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
        </div>
      )}
      
      {/* Display individual exercises */}
      {individualExercises.length > 0 && (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {exercisePairs.map((pair, pairIndex) => (
            <React.Fragment key={`pair-${pairIndex}`}>
              {pair.map((exerciseItem) => {
                const exerciseIndex = exerciseIndexMap[exerciseItem.id];
                
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
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseGrid;
