
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutExercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onRemoveFromGroup?: (exerciseId: string) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
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
  onNavigateToExercise,
  onRemoveFromGroup,
  onAddSet,
  onRemoveSet
}) => {
  // Calculate overall group completion
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(set => set.completed).length, 
    0
  );
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  // Add debugging logs
  useEffect(() => {
    console.log("ExerciseGroupCard rendering with:", {
      groupType,
      exercisesCount: exercises.length,
      exercisesWithSets: exercises.map(ex => ({
        name: ex.exercise.name,
        id: ex.id,
        setsCount: ex.sets?.length || 0,
        sets: ex.sets
      })),
      hasAddSetHandler: !!onAddSet,
      hasRemoveSetHandler: !!onRemoveSet
    });
  }, [exercises, onAddSet, onRemoveSet, groupType]);
  
  return (
    <Card className="mb-4 overflow-hidden rounded-md border bg-white">
      <div className="bg-gray-50 py-1.5 px-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-gray-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{groupType === 'superset' ? 'Superset' : 'Circuit'}</span>
            <span className="text-xs text-gray-500">{progress}% complete</span>
          </div>
        </div>
        
        {onRemoveFromGroup && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-gray-600 hover:text-red-500" 
            title="Ungroup all exercises"
            onClick={() => {
              exercises.forEach(ex => onRemoveFromGroup(ex.id));
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-3">
        <div className="grid grid-cols-1 gap-3">
          {exercises.map((exercise) => {
            const exerciseIndex = exerciseIndexMap[exercise.id];
            const category = exerciseCategories[exercise.exercise.category] || { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
            
            // Create the minimal exercise card layout per screenshot
            return (
              <div key={exercise.id} className="border rounded-md">
                <div className="p-2">
                  {/* Exercise header with image, name, badge, remove */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img 
                        src={exercise.exercise.imageUrl || '/placeholder.svg'} 
                        alt={exercise.exercise.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <h3 className="text-sm font-medium">{exercise.exercise.name}</h3>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs ${category.color}`}>
                            {category.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} sets
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {onRemoveFromGroup && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onRemoveFromGroup(exercise.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Exercise sets table */}
                  <div className="w-full">
                    <div className="grid grid-cols-12 gap-1 mb-1 text-xs font-medium">
                      <div className="col-span-1">#</div>
                      <div className="col-span-3">Weight</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-3">Actual</div>
                      <div className="col-span-2 text-center">Done</div>
                    </div>
                    
                    {exercise.sets.map((set, setIndex) => {
                      const completed = Boolean(set.completed);
                      
                      return (
                        <div key={set.id || `set-${setIndex}`} className="grid grid-cols-12 gap-1 mb-1 items-center text-xs">
                          <div className="col-span-1">{setIndex + 1}</div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={set.weight || ''}
                              onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-1 py-0.5 text-xs border rounded h-7"
                              placeholder="lb/kg"
                            />
                          </div>
                          <div className="col-span-3 text-center">{set.targetReps}</div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={set.actualReps || ''}
                              onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-1 py-0.5 text-xs border rounded h-7"
                              placeholder={`${set.targetReps}`}
                            />
                          </div>
                          <div className="col-span-2 flex justify-center items-center gap-1">
                            <Button
                              variant={completed ? "default" : "outline"}
                              size="sm"
                              className="h-6 w-6 p-0 min-w-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetCompletion(exerciseIndex, setIndex, !completed);
                              }}
                            >
                              {completed ? "✓" : ""}
                            </Button>
                            
                            {onRemoveSet && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 min-w-0 text-red-500"
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
                      );
                    })}
                    
                    {/* Add Set button */}
                    {onAddSet && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7 mt-2 border-dashed"
                        onClick={() => onAddSet(exerciseIndex)}
                      >
                        + Add Set
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ExerciseGroupCard;
