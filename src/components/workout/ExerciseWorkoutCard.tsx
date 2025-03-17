
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
    onNavigateToExercise(exerciseIndex);
  };
  
  return (
    <Card 
      id={`exercise-${exerciseIndex}`}
      className={`mb-4 ${inGroup ? 'border' : 'border-2'} ${
        exerciseIndex === currentExerciseIndex && !isSelected ? 'border-primary' : 
        isSelected ? 'border-primary/70 bg-primary/5' : 'border-border'
      } overflow-hidden`}
    >
      <div className="p-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start">
          {/* Larger image on the left */}
          <div 
            className={`${isCompact ? 'h-24 w-24' : 'h-32 w-32'} rounded bg-cover bg-center mr-3 flex-shrink-0`}
            style={{ backgroundImage: `url(${exerciseItem.exercise.imageUrl})` }}
          />
          
          <div className="flex-1">
            {/* Exercise header info */}
            <div className="flex items-start justify-between mb-2">
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
            
            {/* Always show sets - no more expanding/collapsing */}
            <div className={`grid grid-cols-12 text-xs font-medium mb-1 gap-1`}>
              <div className="col-span-1">#</div>
              <div className="col-span-3">Weight</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-3">Actual</div>
              <div className="col-span-3 text-right">Done</div>
            </div>
            
            {exerciseItem.sets.map((set, setIndex) => (
              <div key={set.id} className={`grid grid-cols-12 items-center gap-1 mb-1`}>
                <div className="col-span-1 font-medium text-xs">{setIndex + 1}</div>
                
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="lb/kg"
                    className={`w-full border rounded px-2 py-1 text-xs`}
                    value={set.weight || ''}
                    onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                  />
                </div>
                
                <div className="col-span-2 text-center text-xs">
                  {set.targetReps}
                </div>
                
                <div className="col-span-3">
                  <input
                    type="text"
                    className={`w-full border rounded px-2 py-1 text-xs`}
                    value={set.actualReps || ''}
                    onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                  />
                </div>
                
                <div className="col-span-3 flex justify-end">
                  <Button
                    variant={set.completed ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-7 px-0`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetCompletion(exerciseIndex, setIndex, !set.completed);
                    }}
                  >
                    {set.completed ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">✓</span>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExerciseWorkoutCard;
