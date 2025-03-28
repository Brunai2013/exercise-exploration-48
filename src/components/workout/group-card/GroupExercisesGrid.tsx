
import React from 'react';
import { WorkoutExercise } from '@/lib/types';
import GroupExerciseItem from './GroupExerciseItem';
import { useIsMobile } from '@/hooks/use-mobile';

interface GroupExercisesGridProps {
  exercises: WorkoutExercise[];
  exerciseIndexMap: Record<string, number>;
  exerciseCategories: Record<string, {name: string, color: string}>;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onRemoveFromGroup?: (exerciseId: string) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
}

const GroupExercisesGrid: React.FC<GroupExercisesGridProps> = ({
  exercises,
  exerciseIndexMap,
  exerciseCategories,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
}) => {
  const isMobile = useIsMobile();
  
  // Create exercise pairs for 2-column layout
  const getExercisePairs = () => {
    const pairs = [];
    for (let i = 0; i < exercises.length; i += 2) {
      pairs.push(exercises.slice(i, i + 2));
    }
    return pairs;
  };

  const exercisePairs = getExercisePairs();
  
  return (
    <div className="p-3">
      <div className="space-y-3">
        {exercisePairs.map((pair, pairIndex) => (
          <div key={`pair-${pairIndex}`} className="grid grid-cols-2 gap-2">
            {pair.map((exercise) => {
              const exerciseIndex = exerciseIndexMap[exercise.id];
              const category = exerciseCategories[exercise.exercise.category] || { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
              const completedSets = exercise.sets.filter(s => s.completed).length;
              
              return (
                <GroupExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  category={category}
                  exerciseIndex={exerciseIndex}
                  completedSets={completedSets}
                  onSetCompletion={onSetCompletion}
                  onWeightChange={onWeightChange}
                  onActualRepsChange={onActualRepsChange}
                  onRemoveFromGroup={onRemoveFromGroup}
                  onAddSet={onAddSet}
                  onRemoveSet={onRemoveSet}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupExercisesGrid;
