import React, { useEffect } from 'react';
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
  useEffect(() => {
    console.log("ExerciseWorkoutCard mounted:", { 
      exerciseName: exerciseItem.exercise.name,
      exerciseId: exerciseItem.id,
      setsArray: exerciseItem.sets,
      setsLength: exerciseItem.sets?.length || 0,
      index: exerciseIndex,
      isCompact,
      inGroup,
      hasAddSet: !!onAddSet,
      hasRemoveSet: !!onRemoveSet
    });
  }, [exerciseItem, exerciseIndex, isCompact, inGroup, onAddSet, onRemoveSet]);
  
  // Ensure sets is always an array
  const exerciseSets = Array.isArray(exerciseItem.sets) ? exerciseItem.sets : [];
  const completedSets = exerciseSets.filter(set => set.completed).length;
  const exerciseProgress = exerciseSets.length > 0 ? Math.round((completedSets / exerciseSets.length) * 100) : 0;
  
  const getCategory = (categoryId?: string) => {
    if (!categoryId) return { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
    return exerciseCategories[categoryId] || { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
  };
  
  const category = getCategory(exerciseItem.exercise.category);
  
  // Determine card classes based on conditions
  const getCardClasses = () => {
    if (inGroup) {
      return 'w-full'; // No border when in group as the parent container handles it
    }
    
    const classes = [];
    classes.push('mb-2', 'overflow-hidden', 'relative');
    
    if (exerciseIndex === currentExerciseIndex && !isSelected) {
      classes.push('border-2', 'border-primary');
    } else if (isSelected) {
      classes.push('border-2', 'border-primary/70', 'bg-primary/5');
    } else {
      classes.push('border-2', 'border-border');
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

  // Determine if we should wrap with a Card or just render the content
  const cardContent = (
    <div className={`p-2 cursor-pointer`} onClick={handleCardClick}>
      <div className="flex items-start">
        {/* Exercise image - smaller in compact mode */}
        <div 
          className={`${isCompact ? 'h-12 w-12' : 'h-24 w-24'} rounded bg-cover bg-center mr-2 flex-shrink-0`}
          style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
        />
        
        <div className="flex-1 min-w-0">
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
            isCompact={isCompact}
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
          />
        </div>
      </div>
    </div>
  );

  // If inside a group, don't wrap in Card
  if (inGroup) {
    return cardContent;
  }

  // Otherwise use Card component
  return (
    <Card className={getCardClasses()}>
      {cardContent}
    </Card>
  );
};

export default ExerciseWorkoutCard;
