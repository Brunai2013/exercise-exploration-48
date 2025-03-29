
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutExercise } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import GroupCardHeader from './group-card/GroupCardHeader';
import GroupExercisesGrid from './group-card/GroupExercisesGrid';

interface ExerciseGroupCardProps {
  groupType: 'superset' | 'circuit';
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  exerciseIndexMap: Record<string, number>;
  exerciseCategories: Record<string, {name: string, color: string}>;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onNavigateToExercise: (index: number) => void;
  onRemoveFromGroup?: (exerciseId: string) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
}

const ExerciseGroupCard: React.FC<ExerciseGroupCardProps> = ({
  groupType,
  exercises,
  currentExerciseIndex,
  exerciseIndexMap,
  exerciseCategories,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onNavigateToExercise,
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
}) => {
  // Calculate overall group completion
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(set => set.completed).length, 
    0
  );
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  // Add debugging logs
  useEffect(() => {
    console.log("ExerciseGroupCard rendering with:", {
      groupType,
      exercisesCount: exercises.length,
      exercisesWithSets: exercises.map(ex => ({
        name: ex.exercise.name,
        id: ex.id,
        setsCount: ex.sets?.length || 0,
        sets: ex.sets
      })),
      hasAddSetHandler: !!onAddSet,
      hasRemoveSetHandler: !!onRemoveSet
    });
  }, [exercises, onAddSet, onRemoveSet, groupType]);

  const handleUngroupAll = () => {
    if (onRemoveFromGroup) {
      exercises.forEach(ex => onRemoveFromGroup(ex.id));
    }
  };
  
  return (
    <Card className="overflow-hidden rounded-md border-2 shadow-sm w-full bg-white relative border-teal-300">
      <GroupCardHeader 
        progress={progress} 
        onUngroupAll={onRemoveFromGroup ? handleUngroupAll : undefined} 
      />
      
      <GroupExercisesGrid
        exercises={exercises}
        exerciseIndexMap={exerciseIndexMap}
        exerciseCategories={exerciseCategories}
        onSetCompletion={onSetCompletion}
        onWeightChange={onWeightChange}
        onActualRepsChange={onActualRepsChange}
        onRemoveFromGroup={onRemoveFromGroup}
        onAddSet={onAddSet}
        onRemoveSet={onRemoveSet}
      />
    </Card>
  );
};

export default ExerciseGroupCard;
