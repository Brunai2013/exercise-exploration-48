
import React from 'react';
import { WorkoutExercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupExerciseItemProps {
  exercise: WorkoutExercise;
  category: { name: string; color: string };
  exerciseIndex: number;
  completedSets: number;
  onSetCompletion: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: string) => void;
  onActualRepsChange: (exerciseIndex: number, setIndex: number, reps: string) => void;
  onRemoveFromGroup?: (exerciseId: string) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
}

const GroupExerciseItem: React.FC<GroupExerciseItemProps> = ({
  exercise,
  category,
  exerciseIndex,
  completedSets,
  onSetCompletion,
  onWeightChange,
  onActualRepsChange,
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
}) => {
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* Exercise Header */}
      <div className="p-2 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={exercise.exercise.imageUrl || '/placeholder.svg'} 
              alt={exercise.exercise.name}
              className="w-10 h-10 object-cover rounded-md flex-shrink-0"
            />
            <div>
              <h3 className="text-xs font-medium line-clamp-1">{exercise.exercise.name}</h3>
              <div className="flex items-center space-x-1">
                <Badge className={`text-xs px-1.5 py-0 h-4 ${category.color}`}>
                  {category.name}
                </Badge>
                <span className="text-xs text-gray-500">
                  {completedSets}/{exercise.sets.length} sets
                </span>
              </div>
            </div>
          </div>
          
          {onRemoveFromGroup && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromGroup(exercise.id);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Sets Table */}
      <div className="p-2">
        {/* Header Row */}
        <div className="grid grid-cols-[16px_1fr_30px_30px_30px] gap-1 text-xs font-medium mb-1">
          <div className="text-center">#</div>
          <div>Weight</div>
          <div className="text-center">Reps</div>
          <div className="text-center">Act</div>
          <div className="text-center">Done</div>
        </div>
        
        {/* Set Rows */}
        {exercise.sets.map((set, setIndex) => (
          <div 
            key={set.id || `set-${setIndex}`} 
            className="grid grid-cols-[16px_1fr_30px_30px_30px] gap-1 items-center mb-1 text-xs"
          >
            <div className="text-center font-medium">{setIndex + 1}</div>
            <div>
              <input
                type="text"
                value={set.weight || ''}
                placeholder="lb/kg"
                className="w-full h-6 px-1 text-xs border rounded"
                onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="text-center">{set.targetReps}</div>
            <div className="text-center">
              <input
                type="text"
                value={set.actualReps || ''}
                placeholder={String(set.targetReps)}
                className="w-full h-6 px-1 text-xs border rounded"
                onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex justify-center items-center">
              <Button
                variant={set.completed ? "default" : "outline"}
                size="sm"
                className={`h-5 w-5 p-0 min-w-0 ${set.completed ? 'bg-blue-600 text-white' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetCompletion(exerciseIndex, setIndex, !set.completed);
                }}
              >
                {set.completed ? "✓" : ""}
              </Button>
              
              {onRemoveSet && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 min-w-0 text-red-500 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSet(exerciseIndex, setIndex);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Set Button */}
        {onAddSet && (
          <Button 
            variant="outline"
            size="sm"
            className="w-full text-xs h-6 mt-1 border-dashed"
            onClick={(e) => {
              e.stopPropagation();
              onAddSet(exerciseIndex);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Set
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupExerciseItem;
