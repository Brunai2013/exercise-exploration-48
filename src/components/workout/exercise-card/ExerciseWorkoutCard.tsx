
import React from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutExercise } from '@/lib/types';
import ExerciseCardHeader from './ExerciseCardHeader';
import ExerciseSetsGrid from './ExerciseSetsGrid';

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
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
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
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
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
  
  // Determine card classes based on conditions
  const getCardClasses = () => {
    const classes = [];
    
    // Base classes
    classes.push('mb-4');
    classes.push(inGroup ? 'border' : 'border-2');
    classes.push('overflow-hidden', 'relative');
    
    // Conditional classes
    if (exerciseIndex === currentExerciseIndex && !isSelected) {
      classes.push('border-primary');
    } else if (isSelected) {
      classes.push('border-primary/70', 'bg-primary/5');
    } else {
      classes.push('border-border');
    }
    
    return classes.join(' ');
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    console.log("Card clicked:", exerciseItem.exercise.name);
    if (onSelect) {
      onSelect();
    } else {
      onNavigateToExercise(exerciseIndex);
    }
  };

  return (
    <Card 
      id={`exercise-${exerciseIndex}`}
      className={getCardClasses()}
    >
      <div className="p-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start">
          {/* Exercise image */}
          <div 
            className={`${isCompact ? 'h-24 w-24' : 'h-32 w-32'} rounded bg-cover bg-center mr-3 flex-shrink-0`}
            style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
          />
          
          <div className="flex-1">
            <ExerciseCardHeader
              exerciseName={exerciseItem.exercise.name}
              category={category}
              completedSets={completedSets}
              totalSets={exerciseSets.length}
              exerciseProgress={exerciseProgress}
              isCompact={isCompact}
              onRemoveFromGroup={onRemoveFromGroup}
            />
            
            <ExerciseSetsGrid
              exerciseSets={exerciseSets}
              exerciseIndex={exerciseIndex}
              onWeightChange={onWeightChange}
              onActualRepsChange={onActualRepsChange}
              onSetCompletion={onSetCompletion}
              categoryColor={category.color}
              onAddSet={onAddSet ? () => onAddSet(exerciseIndex) : undefined}
              onRemoveSet={onRemoveSet}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExerciseWorkoutCard;
