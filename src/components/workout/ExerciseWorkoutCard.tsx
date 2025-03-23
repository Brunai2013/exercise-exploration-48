
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { WorkoutExercise } from '@/lib/types';

interface ExerciseWorkoutCardProps {
  exerciseItem: WorkoutExercise;
  exerciseIndex: number;
  currentExerciseIndex: number;
  exerciseCategories: Record<string, {name: string, color: string}>;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onNavigateToExercise: (index: number) => void;
  isCompact?: boolean;
  inGroup?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemoveFromGroup?: () => void;
}

const ExerciseWorkoutCard: React.FC<ExerciseWorkoutCardProps> = ({
  exerciseItem,
  exerciseIndex,
  currentExerciseIndex,
  exerciseCategories,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onNavigateToExercise,
  isCompact = false,
  inGroup = false,
  isSelected = false,
  onSelect,
  onRemoveFromGroup
}) => {
  // Add more explicit logging to debug issues
  console.log("ExerciseWorkoutCard rendering:", { 
    exerciseName: exerciseItem.exercise.name,
    exerciseId: exerciseItem.id,
    sets: exerciseItem.sets || [],
    index: exerciseIndex,
    isCurrentExercise: exerciseIndex === currentExerciseIndex
  });
  
  const exerciseSets = exerciseItem.sets || [];
  const completedSets = exerciseSets.filter(set => set.completed).length;
  const exerciseProgress = exerciseSets.length > 0 ? Math.round((completedSets / exerciseSets.length) * 100) : 0;
  
  const getCategory = (categoryId?: string) => {
    if (!categoryId) return { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
    return exerciseCategories[categoryId] || { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
  };
  
  const category = getCategory(exerciseItem.exercise.category);
  
  // Safe way to set card style without using string interpolation that might trigger CSP
  const getCardClasses = () => {
    let baseClasses = `mb-4 ${inGroup ? 'border' : 'border-2'} overflow-hidden relative`;
    
    if (exerciseIndex === currentExerciseIndex && !isSelected) {
      return `${baseClasses} border-primary`;
    } else if (isSelected) {
      return `${baseClasses} border-primary/70 bg-primary/5`;
    } else {
      return `${baseClasses} border-border`;
    }
  };
  
  // Handle card style props separately to avoid CSP issues with inline styles
  const getCardStyle = () => {
    const style: React.CSSProperties = {};
    
    if (exerciseIndex === currentExerciseIndex && !isSelected) {
      if (category.color && !category.color.startsWith('bg-')) {
        style.borderColor = category.color;
      }
    } else if (isSelected) {
      style.borderColor = 'hsl(var(--primary) / 0.7)';
      style.backgroundColor = 'hsl(var(--primary) / 0.05)';
    }
    
    return style;
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    console.log("Card clicked:", exerciseItem.exercise.name);
    if (onSelect) {
      onSelect();
    } else {
      onNavigateToExercise(exerciseIndex);
    }
  };

  // Handle weight change with direct function
  const handleWeightChange = (setIndex: number, value: string) => {
    console.log('Weight changed:', value);
    onWeightChange(exerciseIndex, setIndex, value);
  };

  // Handle reps change with direct function
  const handleRepsChange = (setIndex: number, value: string) => {
    console.log('Actual reps changed:', value);
    onActualRepsChange(exerciseIndex, setIndex, value);
  };

  // Handle set completion with direct function
  const handleSetComplete = (setIndex: number, completed: boolean) => {
    console.log('Set completion toggled:', !completed);
    onSetCompletion(exerciseIndex, setIndex, !completed);
  };
  
  return (
    <Card 
      id={`exercise-${exerciseIndex}`}
      className={getCardClasses()}
      style={getCardStyle()}
    >
      <div className="p-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start">
          {/* Exercise image */}
          <div 
            className={`${isCompact ? 'h-24 w-24' : 'h-32 w-32'} rounded bg-cover bg-center mr-3 flex-shrink-0`}
            style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
          />
          
          <div className="flex-1">
            {/* Exercise header info */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className={`font-medium ${isCompact ? 'text-sm' : ''}`}>{exerciseItem.exercise.name}</h4>
                <div className="flex items-center mt-1">
                  <Badge className={`mr-2 ${category.color}`}>
                    {category.name}
                  </Badge>
                  <span className={`text-sm ${exerciseProgress === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {completedSets}/{exerciseSets.length} sets
                  </span>
                </div>
              </div>
              
              {/* Remove from group button if applicable */}
              {onRemoveFromGroup && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromGroup();
                  }}
                  title="Remove from group"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
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
                <div key={set.id} className="grid grid-cols-12 items-center gap-1 mb-1">
                  <div className="col-span-1 font-medium text-xs">{setIndex + 1}</div>
                  
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="lb/kg"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={set.weight !== undefined ? String(set.weight) : ''}
                      onChange={(e) => handleWeightChange(setIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="col-span-2 text-center text-xs">
                    {set.targetReps}
                  </div>
                  
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={set.actualReps !== undefined ? String(set.actualReps) : ''}
                      onChange={(e) => handleRepsChange(setIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="col-span-3 flex justify-end">
                    <Button
                      variant={set.completed ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-7 px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetComplete(setIndex, set.completed);
                      }}
                      style={set.completed && !category.color.startsWith('bg-') ? { backgroundColor: category.color } : {}}
                    >
                      {set.completed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="text-xs">✓</span>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No sets defined for this exercise
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExerciseWorkoutCard;
