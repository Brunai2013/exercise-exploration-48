
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import ExerciseWorkoutCard from './exercise-card';
import { WorkoutExercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseGroupCardProps {
  groupType: 'superset' | 'circuit';
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  exerciseIndexMap: Record<string, number>; // Maps exercise IDs to their indices in the full list
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
  
  return (
    <Card className="mb-6 overflow-hidden border-2 border-primary/20">
      <div className="bg-primary/10 p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          <Badge variant="outline" className="font-semibold">
            {groupType === 'superset' ? 'Superset' : 'Circuit'}
          </Badge>
          <span className="ml-2 text-sm text-muted-foreground">
            {progress}% complete
          </span>
        </div>
        
        {onRemoveFromGroup && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            title="Ungroup all exercises"
            onClick={() => {
              exercises.forEach(ex => onRemoveFromGroup(ex.id));
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
        {exercises.map((exercise) => {
          const exerciseIndex = exerciseIndexMap[exercise.id];
          console.log("Rendering exercise in group:", {
            name: exercise.exercise.name,
            id: exercise.id,
            setsCount: exercise.sets?.length || 0
          });
          
          return (
            <ExerciseWorkoutCard
              key={exercise.id}
              exerciseItem={exercise}
              exerciseIndex={exerciseIndex}
              currentExerciseIndex={currentExerciseIndex}
              onSetCompletion={onSetCompletion}
              onWeightChange={onWeightChange}
              onActualRepsChange={onActualRepsChange}
              onNavigateToExercise={onNavigateToExercise}
              exerciseCategories={exerciseCategories}
              isCompact={true}
              inGroup={true}
              onRemoveFromGroup={onRemoveFromGroup ? () => onRemoveFromGroup(exercise.id) : undefined}
              onAddSet={onAddSet ? () => onAddSet(exerciseIndex) : undefined}
              onRemoveSet={onRemoveSet ? (setIndex) => onRemoveSet(exerciseIndex, setIndex) : undefined}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default ExerciseGroupCard;
