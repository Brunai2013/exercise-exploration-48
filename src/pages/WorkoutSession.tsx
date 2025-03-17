import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById, updateWorkout } from '@/lib/workouts';
import { Workout, WorkoutExercise } from '@/lib/types';
import { getCategoryById } from '@/lib/categories';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  Clock, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  Save, 
  Dumbbell, 
  Loader2,
  Layers,
  Plus,
  X,
  Check
} from 'lucide-react';
import ExerciseWorkoutCard from '@/components/workout/ExerciseWorkoutCard';
import ExerciseGroupCard from '@/components/workout/ExerciseGroupCard';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';

interface ExerciseGroup {
  id: string;
  type: 'circuit';
  exerciseIds: string[];
}

const WorkoutSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseCategories, setExerciseCategories] = useState<Record<string, {name: string, color: string}>>({});
  
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([]);
  
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  
  const [groupingMode, setGroupingMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (id) {
        try {
          setLoading(true);
          const foundWorkout = await getWorkoutById(id);
          if (foundWorkout) {
            const initializedWorkout = {
              ...foundWorkout,
              exercises: foundWorkout.exercises.map(exercise => ({
                ...exercise,
                sets: exercise.sets.map(set => ({
                  ...set,
                  completed: false,
                  actualReps: set.targetReps
                }))
              }))
            };
            setWorkout(initializedWorkout);
            
            const categories: Record<string, {name: string, color: string}> = {};
            for (const exercise of initializedWorkout.exercises) {
              if (exercise.exercise.category) {
                const category = await getCategoryById(exercise.exercise.category);
                if (category) {
                  categories[exercise.exercise.category] = {
                    name: category.name,
                    color: category.color
                  };
                }
              }
            }
            setExerciseCategories(categories);
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
          toast({
            title: "Error",
            description: "Failed to load workout. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkout();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (workout) {
      const totalSets = workout.exercises.reduce(
        (total, exercise) => total + exercise.sets.length, 
        0
      );
      
      const completedSets = workout.exercises.reduce(
        (total, exercise) => 
          total + exercise.sets.filter(set => set.completed).length, 
        0
      );
      
      const calculatedProgress = totalSets > 0 
        ? Math.round((completedSets / totalSets) * 100) 
        : 0;
      
      setProgress(calculatedProgress);
    }
  }, [workout]);

  const isExerciseInGroup = (exerciseId: string): boolean => {
    return exerciseGroups.some(group => 
      group.exerciseIds.includes(exerciseId)
    );
  };
  
  const getExerciseGroup = (exerciseId: string): ExerciseGroup | undefined => {
    return exerciseGroups.find(group => 
      group.exerciseIds.includes(exerciseId)
    );
  };
  
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };
  
  const clearSelectedExercises = () => {
    setSelectedExercises([]);
  };
  
  const createGroup = (exerciseIds: string[]) => {
    if (exerciseIds.length < 2) {
      toast({
        title: "Cannot Create Circuit",
        description: "Need at least 2 exercises for a circuit",
        variant: "destructive",
      });
      return;
    }
    
    setExerciseGroups(prev => {
      const affectedGroups = prev.filter(group => 
        group.exerciseIds.some(id => exerciseIds.includes(id))
      );
      
      if (affectedGroups.length > 0) {
        const updatedGroups = prev.map(group => ({
          ...group,
          exerciseIds: group.exerciseIds.filter(id => !exerciseIds.includes(id))
        })).filter(group => group.exerciseIds.length > 1);
        
        return [
          ...updatedGroups,
          { id: uuidv4(), type: 'circuit', exerciseIds }
        ];
      } else {
        return [
          ...prev,
          { id: uuidv4(), type: 'circuit', exerciseIds }
        ];
      }
    });
    
    clearSelectedExercises();
    setGroupingMode(false);
  };
  
  const removeFromGroup = (exerciseId: string) => {
    setExerciseGroups(prev => {
      const updatedGroups = prev.map(group => {
        if (group.exerciseIds.includes(exerciseId)) {
          const updatedIds = group.exerciseIds.filter(id => id !== exerciseId);
          return {
            ...group,
            exerciseIds: updatedIds
          };
        }
        return group;
      }).filter(group => group.exerciseIds.length > 1);
      
      return updatedGroups;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetCompletion = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    if (!workout) return;
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      const updatedExercises = [...prevWorkout.exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        completed
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });

    if (completed) {
      const audio = new Audio('/completion-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore errors on audio play (common in some browsers)
      });
    }
  };

  const handleWeightChange = (exerciseIndex: number, setIndex: number, weight: string) => {
    if (!workout) return;
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      const updatedExercises = [...prevWorkout.exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        weight: parseInt(weight) || 0
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });
  };

  const handleActualRepsChange = (exerciseIndex: number, setIndex: number, reps: string) => {
    if (!workout) return;
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      const updatedExercises = [...prevWorkout.exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        actualReps: parseInt(reps) || 0
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });
  };

  const saveWorkoutProgress = async () => {
    if (!workout) return;
    
    try {
      setIsSaving(true);
      
      const updatedWorkout = {
        ...workout,
        progress,
        completed: progress === 100
      };
      
      await updateWorkout(updatedWorkout);
      
      toast({
        title: progress === 100 ? "Workout Complete! 💪" : "Progress Saved!",
        description: progress === 100 
          ? "Congratulations on completing your workout!" 
          : "Your workout progress has been saved.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving workout progress:', error);
      toast({
        title: "Error",
        description: "Failed to save workout progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateToExercise = (index: number) => {
    setCurrentExerciseIndex(index);
    document.getElementById(`exercise-${index}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleCreateCircuit = () => {
    if (!workout || workout.exercises.length < 2) return;
    
    const availableExercises = workout.exercises
      .filter(ex => !isExerciseInGroup(ex.id))
      .slice(0, 2)
      .map(ex => ex.id);
    
    if (availableExercises.length >= 2) {
      createGroup(availableExercises);
      toast({
        title: "Circuit Created",
        description: "Exercises have been grouped as a circuit",
      });
    } else {
      toast({
        title: "Cannot Create Circuit",
        description: "Need at least 2 ungrouped exercises",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomGroup = () => {
    if (selectedExercises.length < 2) {
      toast({
        title: "Not Enough Exercises",
        description: "Select at least 2 exercises for a circuit",
        variant: "destructive",
      });
      return;
    }
    
    createGroup(selectedExercises);
    
    toast({
      title: "Circuit Created",
      description: `${selectedExercises.length} exercises grouped successfully`,
    });
  };

  const createExerciseIndexMap = (): Record<string, number> => {
    if (!workout) return {};
    
    return workout.exercises.reduce((map, exercise, index) => {
      map[exercise.id] = index;
      return map;
    }, {} as Record<string, number>);
  };

  const startGroupingMode = () => {
    setGroupingMode(true);
    clearSelectedExercises();
    
    toast({
      title: "Creating Circuit",
      description: "Select at least 2 exercises to group",
    });
  };

  const cancelGroupingMode = () => {
    setGroupingMode(false);
    clearSelectedExercises();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-lg">Loading workout session...</p>
        </div>
      </PageContainer>
    );
  }

  if (!workout) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Workout Not Found</h2>
          <p className="mb-6">The workout you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/calendar')}>
            Back to Calendar
          </Button>
        </div>
      </PageContainer>
    );
  }

  const exerciseIndexMap = createExerciseIndexMap();

  return (
    <PageContainer>
      <PageHeader
        title={`${workout?.name}`}
        description={`Get ready to crush it! ${workout?.description || ''}`}
        action={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <Button onClick={saveWorkoutProgress} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {progress === 100 ? "Complete Workout" : "Save Progress"}
                </>
              )}
            </Button>
          </div>
        }
      />

      <Card className="mb-6 border-2 border-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Workout Time</span>
              <span className="text-2xl font-semibold">{formatTime(elapsedTime)}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
              <Dumbbell className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Exercises</span>
              <span className="text-2xl font-semibold">{workout?.exercises.length}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Completion</span>
              <span className="text-2xl font-semibold">{progress}%</span>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {workout?.exercises.map((exercise, index) => {
              const exerciseSets = exercise.sets;
              const completedSets = exerciseSets.filter(set => set.completed).length;
              const exerciseProgress = Math.round((completedSets / exerciseSets.length) * 100);
              
              return (
                <Button
                  key={exercise.id}
                  variant={currentExerciseIndex === index ? "default" : "outline"}
                  className={`whitespace-nowrap ${selectedExercises.includes(exercise.id) ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    if (groupingMode) {
                      toggleExerciseSelection(exercise.id);
                    } else {
                      handleNavigateToExercise(index);
                    }
                  }}
                >
                  {exercise.exercise.name}
                  {exerciseProgress === 100 && !groupingMode && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
                  {selectedExercises.includes(exercise.id) && groupingMode && <Check className="ml-2 h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex gap-2">
          {groupingMode ? (
            <>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleCreateCustomGroup}
                disabled={selectedExercises.length < 2}
              >
                <Layers className="h-4 w-4 mr-2" />
                Create Circuit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={cancelGroupingMode}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={startGroupingMode}
              >
                <Plus className="h-4 w-4 mr-2" />
                Group Exercises
              </Button>
            </>
          )}
        </div>
      </div>
      
      {groupingMode && (
        <div className="bg-muted/20 p-4 rounded-lg mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-muted-foreground" />
          <div className="flex-1">
            <h4 className="font-medium">Create Exercise Group</h4>
            <p className="text-sm text-muted-foreground">Select 2 or more exercises to group together as a circuit.</p>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Selected: {selectedExercises.length}</span>
            {selectedExercises.length > 0 && (
              <Badge variant="outline">{selectedExercises.length}</Badge>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {exerciseGroups.map(group => {
          const groupExercises = workout?.exercises.filter(ex => 
            group.exerciseIds.includes(ex.id)
          );
          
          if (!groupExercises || groupExercises.length < 2) return null;
          
          return (
            <ExerciseGroupCard
              key={group.id}
              groupType={group.type}
              exercises={groupExercises}
              currentExerciseIndex={currentExerciseIndex}
              exerciseIndexMap={exerciseIndexMap}
              exerciseCategories={exerciseCategories}
              onSetCompletion={handleSetCompletion}
              onWeightChange={handleWeightChange}
              onActualRepsChange={handleActualRepsChange}
              onNavigateToExercise={handleNavigateToExercise}
              onRemoveFromGroup={removeFromGroup}
            />
          );
        })}
        
        {workout?.exercises.map((exerciseItem, exerciseIndex) => {
          if (isExerciseInGroup(exerciseItem.id)) return null;
          
          return (
            <ExerciseWorkoutCard
              key={exerciseItem.id}
              exerciseItem={exerciseItem}
              exerciseIndex={exerciseIndex}
              currentExerciseIndex={currentExerciseIndex}
              onSetCompletion={handleSetCompletion}
              onWeightChange={handleWeightChange}
              onActualRepsChange={handleActualRepsChange}
              onNavigateToExercise={handleNavigateToExercise}
              exerciseCategories={exerciseCategories}
              isCompact={true}
              isSelected={selectedExercises.includes(exerciseItem.id)}
              onSelect={groupingMode ? () => toggleExerciseSelection(exerciseItem.id) : undefined}
            />
          );
        })}
      </div>

      {progress === 100 && (
        <div className="flex flex-col items-center justify-center bg-green-50 p-8 rounded-lg mb-8 animate-fade-in">
          <Award className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Workout Complete!</h2>
          <p className="text-green-600 mb-4 text-center">Congratulations on completing your workout! Save your progress to record this achievement.</p>
          <Button onClick={saveWorkoutProgress} size="lg" className="bg-green-500 hover:bg-green-600" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save & Complete
              </>
            )}
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default WorkoutSession;
