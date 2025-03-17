
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { WorkoutExercise, ExerciseSet } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Dumbbell } from 'lucide-react';

interface ExerciseWorkoutCardProps {
  exerciseItem: WorkoutExercise;
  exerciseIndex: number;
  currentExerciseIndex: number;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onNavigateToExercise: (index: number) => void;
  exerciseCategories: Record<string, {name: string, color: string}>;
}

const ExerciseWorkoutCard: React.FC<ExerciseWorkoutCardProps> = ({
  exerciseItem,
  exerciseIndex,
  currentExerciseIndex,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onNavigateToExercise,
  exerciseCategories
}) => {
  const [imageError, setImageError] = useState(false);
  
  const exerciseSets = exerciseItem.sets;
  const completedSets = exerciseSets.filter(set => set.completed).length;
  const exerciseProgress = Math.round((completedSets / exerciseSets.length) * 100);
  
  const getCategoryDisplay = (categoryId: string) => {
    if (exerciseCategories[categoryId]) {
      return (
        <span className={cn('text-xs px-2 py-1 rounded-full', exerciseCategories[categoryId].color)}>
          {exerciseCategories[categoryId].name}
        </span>
      );
    }
    
    return null;
  };

  return (
    <Card 
      id={`exercise-${exerciseIndex}`}
      className={cn(
        "overflow-hidden transition-all duration-300",
        currentExerciseIndex === exerciseIndex ? 'border-primary ring-2 ring-primary/20' : '',
        "mb-6"
      )}
      onClick={() => onNavigateToExercise(exerciseIndex)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image and exercise info */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="relative h-full">
            {!imageError && exerciseItem.exercise.imageUrl ? (
              <img 
                src={exerciseItem.exercise.imageUrl} 
                alt={exerciseItem.exercise.name}
                className="object-cover w-full h-full aspect-square"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full aspect-square bg-muted">
                <Dumbbell className="h-16 w-16 text-gray-300" />
              </div>
            )}
            
            {/* Exercise progress badge */}
            {exerciseProgress === 100 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Exercise details and sets */}
        <div className="p-4 md:p-6 flex-1">
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-xl font-semibold">{exerciseItem.exercise.name}</h3>
              {exerciseItem.exercise.category && getCategoryDisplay(exerciseItem.exercise.category)}
            </div>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{exerciseItem.exercise.description}</p>
            
            <div className="inline-block bg-primary/10 rounded-lg px-3 py-1 text-xs font-medium text-primary">
              {exerciseItem.sets.length} sets
            </div>
          </div>
          
          {/* Compact sets table */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Set</TableHead>
                  <TableHead className="w-[90px]">Previous</TableHead>
                  <TableHead className="w-[120px]">Weight</TableHead>
                  <TableHead className="w-[80px]">Target</TableHead>
                  <TableHead className="w-[120px]">Actual</TableHead>
                  <TableHead className="w-[80px] text-center">Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exerciseItem.sets.map((set, setIndex) => (
                  <TableRow key={set.id} className="h-[52px]">
                    <TableCell>
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center font-medium text-xs">
                        {set.setNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {set.weight || 0}kg × {set.targetReps}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                          className="h-7 w-16 text-sm"
                        />
                        <span className="ml-1 text-xs text-muted-foreground">kg</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-center text-sm">
                      {set.targetReps}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={set.actualReps !== undefined ? set.actualReps : ''}
                          onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                          className="h-7 w-16 text-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className={cn("p-1 rounded-md transition-all", set.completed ? 'bg-green-100' : '')}>
                          <Checkbox
                            id={`set-${exerciseIndex}-${setIndex}`}
                            checked={set.completed}
                            onCheckedChange={(checked) => 
                              onSetCompletion(exerciseIndex, setIndex, checked as boolean)
                            }
                            className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExerciseWorkoutCard;
