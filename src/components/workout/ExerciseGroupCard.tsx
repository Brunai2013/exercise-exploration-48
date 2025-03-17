
import React from 'react';
import { Card } from '@/components/ui/card';
import ExerciseWorkoutCard from './ExerciseWorkoutCard';
import { WorkoutExercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

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
  onNavigateToExercise
}) => {
  // Calculate overall group completion
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(set => set.completed).length, 
    0
  );
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  return (
    <Card className="mb-6 overflow-hidden border-2 border-primary/20">
      <div className="bg-primary/10 p-2 flex items-center">
        <Layers className="h-4 w-4 mr-2" />
        <Badge variant="outline" className="font-semibold">
          {groupType === 'superset' ? 'Superset' : 'Circuit'}
        </Badge>
        <span className="ml-2 text-sm text-muted-foreground">
          {progress}% complete
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
        {exercises.map((exercise) => {
          const exerciseIndex = exerciseIndexMap[exercise.id];
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
            />
          );
        })}
      </div>
    </Card>
  );
};

export default ExerciseGroupCard;
