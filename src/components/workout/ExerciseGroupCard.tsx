
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutExercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Layers, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
    <Card className="overflow-hidden rounded-md border shadow-sm max-w-full mx-auto bg-white relative border-green-300">
      <div className="bg-green-100 py-1.5 px-3 flex items-center justify-between border-b border-green-200">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-green-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-green-800">Circuit</span>
            <span className="text-xs text-green-700">{progress}% complete</span>
          </div>
        </div>
        
        {onRemoveFromGroup && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-green-600 hover:text-red-500" 
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
        <div className="space-y-3">
          {exercises.map((exercise) => {
            const exerciseIndex = exerciseIndexMap[exercise.id];
            const category = exerciseCategories[exercise.exercise.category] || { name: 'Uncategorized', color: 'bg-gray-200 text-gray-700' };
            const completedSets = exercise.sets.filter(s => s.completed).length;
            
            return (
              <div key={exercise.id} className="border rounded-md overflow-hidden bg-white">
                {/* Exercise Header */}
                <div className="p-2 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={exercise.exercise.imageUrl || '/placeholder.svg'} 
                        alt={exercise.exercise.name}
                        className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-medium line-clamp-1">{exercise.exercise.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Badge className={`text-xs px-2 py-0 h-5 ${category.color}`}>
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
                  <div className="grid grid-cols-[20px_1fr_40px_1fr_40px] gap-1 text-xs font-medium mb-1">
                    <div className="text-center">#</div>
                    <div>Weight</div>
                    <div className="text-center">Reps</div>
                    <div>Actual</div>
                    <div className="text-center">Done</div>
                  </div>
                  
                  {/* Set Rows */}
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={set.id || `set-${setIndex}`} 
                      className="grid grid-cols-[20px_1fr_40px_1fr_40px] gap-1 items-center mb-1 text-xs"
                    >
                      <div className="text-center font-medium">{setIndex + 1}</div>
                      <div>
                        <input
                          type="text"
                          value={set.weight || ''}
                          placeholder="lb/kg"
                          className="w-full h-7 px-2 text-xs border rounded"
                          onChange={(e) => onWeightChange(exerciseIndex, setIndex, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="text-center">{set.targetReps}</div>
                      <div>
                        <input
                          type="text"
                          value={set.actualReps || ''}
                          placeholder={String(set.targetReps)}
                          className="w-full h-7 px-2 text-xs border rounded"
                          onChange={(e) => onActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex justify-center items-center">
                        <Button
                          variant={set.completed ? "default" : "outline"}
                          size="sm"
                          className={`h-6 w-6 p-0 min-w-0 ${set.completed ? 'bg-blue-600 text-white' : ''}`}
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
                            className="h-6 w-6 p-0 min-w-0 text-red-500 ml-1"
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
                      className="w-full text-xs h-7 mt-1 border-dashed"
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
          })}
        </div>
      </div>
    </Card>
  );
};

export default ExerciseGroupCard;
