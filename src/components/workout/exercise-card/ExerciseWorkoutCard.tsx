
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

  // Ultra-compact version for when in a group card
  if (isInGroupCard) {
    return (
      <div className="p-1 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start">
          {/* Small exercise image */}
          <div 
            className="h-10 w-10 rounded bg-cover bg-center mr-1.5 flex-shrink-0"
            style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
          />
          
          <div className="flex-1 min-w-0">
            {/* Ultra compact header with minimal info */}
            <div className="flex items-center justify-between mb-0.5">
              <div>
                <h4 className="text-xs font-medium line-clamp-1">{exerciseItem.exercise.name}</h4>
                <div className="flex items-center gap-1">
                  <Badge className="text-[9px] py-0 px-1 h-3.5 min-h-0 min-w-0 leading-none rounded-sm font-normal mr-1 whitespace-nowrap inline-flex items-center justify-center ${category.color}">
                    {category.name}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">
                    {completedSets}/{exerciseSets.length} sets
                  </span>
                  
                  {onRemoveFromGroup && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3.5 w-3.5 p-0 ml-1 min-h-0 min-w-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromGroup();
                      }}
                      title="Remove from group"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ultra-compact sets grid */}
            <ExerciseSetsGrid
              exerciseSets={exerciseSets}
              exerciseIndex={exerciseIndex}
              onWeightChange={onWeightChange}
              onActualRepsChange={onActualRepsChange}
              onSetCompletion={onSetCompletion}
              categoryColor={category.color}
              isCompact={true}
              isInGroupCard={true}
              onAddSet={onAddSet}
              onRemoveSet={onRemoveSet}
            />
          </div>
        </div>
      </div>
    );
  }

  // Create a minimized version for when the card is in a group
  if (inGroup) {
    return (
      <div className="p-2 cursor-pointer" onClick={handleCardClick}>
        <div className="flex flex-col">
          {/* Minimized header with image, name and category */}
          <div className="flex items-start mb-1">
            <div 
              className="h-12 w-12 rounded bg-cover bg-center mr-2 flex-shrink-0"
              style={{ backgroundImage: exerciseItem.exercise.imageUrl ? `url(${exerciseItem.exercise.imageUrl})` : 'none' }}
            />
            
            <div className="flex-1 min-w-0">
              <ExerciseCardHeader
                exerciseName={exerciseItem.exercise.name}
                category={category}
                completedSets={completedSets}
                totalSets={exerciseSets.length}
                exerciseProgress={exerciseProgress}
                isCompact={true}
                onRemoveFromGroup={onRemoveFromGroup}
              />
            </div>
          </div>
          
          {/* Minimized sets grid */}
          <ExerciseSetsGrid
            exerciseSets={exerciseSets}
            exerciseIndex={exerciseIndex}
            onWeightChange={onWeightChange}
            onActualRepsChange={onActualRepsChange}
            onSetCompletion={onSetCompletion}
            categoryColor={category.color}
            isCompact={true}
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
          />
        </div>
      </div>
    );
  }

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
