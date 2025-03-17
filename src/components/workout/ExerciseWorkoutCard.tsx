
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(exerciseIndex === currentExerciseIndex);
  
  const exerciseSets = exerciseItem.sets;
  const completedSets = exerciseSets.filter(set => set.completed).length;
  const exerciseProgress = Math.round((completedSets / exerciseSets.length) * 100);
  
  const getCategory = (categoryId?: string) => {
    if (!categoryId) return { name: 'Uncategorized', color: 'gray' };
    return exerciseCategories[categoryId] || { name: 'Uncategorized', color: 'gray' };
  };
  
  const category = getCategory(exerciseItem.exercise.category);
  
  // Display the badge with the category color
  const categoryBadgeStyle = {
    backgroundColor: `${category.color}20`, // 20% opacity
    color: category.color,
    borderColor: `${category.color}40` // 40% opacity
  };
  
  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
      return;
    }
    setExpanded(!expanded);
    if (!expanded) {
      onNavigateToExercise(exerciseIndex);
    }
  };
  
  return (
    <Card 
      id={`exercise-${exerciseIndex}`}
      className={`mb-4 ${inGroup ? 'border' : 'border-2'} ${
        exerciseIndex === currentExerciseIndex && !isSelected ? 'border-primary' : 
        isSelected ? 'border-primary/70 bg-primary/5' : 'border-border'
      } overflow-hidden`}
    >
      <div 
        className={`flex items-center justify-between p-4 ${isCompact ? 'py-3' : ''} cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className="flex items-center">
          {isSelected && (
            <div className="flex justify-center items-center w-6 h-6 rounded-full bg-primary mr-2">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          
          <div
            className={`${isCompact ? 'h-10 w-10' : 'h-14 w-14'} rounded bg-cover bg-center mr-3`}
            style={{ backgroundImage: `url(${exerciseItem.exercise.imageUrl})` }}
          />
          
          <div>
            <h4 className={`font-medium ${isCompact ? 'text-sm' : ''}`}>{exerciseItem.exercise.name}</h4>
            <div className="flex items-center mt-1">
              <Badge className="mr-2" style={categoryBadgeStyle}>
                {category.name}
              </Badge>
              <span className={`text-sm ${exerciseProgress === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {completedSets}/{exerciseSets.length} sets
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {onRemoveFromGroup && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-1 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromGroup();
              }}
              title="Remove from group"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {!onSelect && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
                if (!expanded) {
                  onNavigateToExercise(exerciseIndex);
                }
              }}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {expanded && (
        <CardContent className={`${isCompact ? 'p-2' : 'p-4'} pt-0`}>
          <div className={`grid grid-cols-12 text-sm font-medium mb-2 ${isCompact ? 'gap-1 text-xs' : 'gap-2'}`}>
            <div className="col-span-1">Set</div>
            <div className="col-span-3">Weight</div>
            <div className="col-span-2 text-center">Reps</div>
            <div className="col-span-3">Actual</div>
            <div className="col-span-3 text-right">Done</div>
          </div>
          
          {exerciseItem.sets.map((set, setIndex) => (
            <div key={set.id} className={`grid grid-cols-12 items-center ${isCompact ? 'gap-1 mb-1' : 'gap-2 mb-2'}`}>
              <div className="col-span-1 font-medium">{setIndex + 1}</div>
              
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="lb/kg"
                  className={`w-full border rounded px-2 ${isCompact ? 'py-1 text-sm' : 'py-2'}`}
                  value={set.weight || ''}
                  onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                />
              </div>
              
              <div className="col-span-2 text-center">
                {set.targetReps}
              </div>
              
              <div className="col-span-3">
                <input
                  type="text"
                  className={`w-full border rounded px-2 ${isCompact ? 'py-1 text-sm' : 'py-2'}`}
                  value={set.actualReps || ''}
                  onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                />
              </div>
              
              <div className="col-span-3 flex justify-end">
                <Button
                  variant={set.completed ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${isCompact ? 'h-8' : ''}`}
                  onClick={() => onSetCompletion(exerciseIndex, setIndex, !set.completed)}
                >
                  {set.completed ? (
                    <>
                      <Check className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      {isCompact ? '' : 'Done'}
                    </>
                  ) : (
                    isCompact ? 'Mark' : 'Mark Done'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default ExerciseWorkoutCard;
