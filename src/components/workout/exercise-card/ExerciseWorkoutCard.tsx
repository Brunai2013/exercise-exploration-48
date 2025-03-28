
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutExercise } from '@/lib/types';
import ExerciseCardHeader from './ExerciseCardHeader';
import ExerciseSetsGrid from './ExerciseSetsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  isInGroupCard?: boolean;
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
  isInGroupCard = false,
  isSelected = false,
  onSelect,
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
}) => {
  // Add explicit logging to debug issues
  useEffect(() => {
    console.log("ExerciseWorkoutCard mounted:", { 
      exerciseName: exerciseItem.exercise.name,
      exerciseId: exerciseItem.id,
      setsArray: exerciseItem.sets,
      setsLength: exerciseItem.sets?.length || 0,
      index: exerciseIndex,
      isCompact,
      inGroup,
      isInGroupCard,
      hasAddSet: !!onAddSet,
      hasRemoveSet: !!onRemoveSet
    });
  }, [exerciseItem, exerciseIndex, isCompact, inGroup, isInGroupCard, onAddSet, onRemoveSet]);
  
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
      classes.push('border', 'border-border');
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

  // We no longer need the ultra-compact or in-group versions since those are handled
  // directly in the ExerciseGroupCard component now

  // Regular card view for non-grouped exercises
  return (
    <Card className={getCardClasses()}>
      <div className="p-4 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start">
          {/* Exercise image - regular size for standalone cards */}
          <div 
            className="h-20 w-20 rounded bg-cover bg-center mr-3 flex-shrink-0"
            style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
          />
          
          <div className="flex-1 min-w-0">
            <ExerciseCardHeader
              exerciseName={exerciseItem.exercise.name}
              category={category}
              completedSets={completedSets}
              totalSets={exerciseSets.length}
              exerciseProgress={exerciseProgress}
              isCompact={false}
              onRemoveFromGroup={onRemoveFromGroup}
            />
            
            <ExerciseSetsGrid
              exerciseSets={exerciseSets}
              exerciseIndex={exerciseIndex}
              onWeightChange={onWeightChange}
              onActualRepsChange={onActualRepsChange}
              onSetCompletion={onSetCompletion}
              categoryColor={category.color}
              isCompact={false}
              onAddSet={onAddSet}
              onRemoveSet={onRemoveSet}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExerciseWorkoutCard;
