
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById, updateWorkout } from '@/lib/workouts';
import { Workout, WorkoutExercise, ExerciseSet } from '@/lib/types';
import { getCategoryById, getCategoryByIdSync } from '@/lib/categories';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Clock, CheckCircle2, Award, ArrowLeft, Save, Dumbbell, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const fetchWorkout = async () => {
      if (id) {
        try {
          setLoading(true);
          const foundWorkout = await getWorkoutById(id);
          if (foundWorkout) {
            // Initialize workout sets for tracking
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
            
            // Load categories for all exercises
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

  const getCategoryDisplay = (categoryId: string) => {
    if (exerciseCategories[categoryId]) {
      return (
        <span className={cn('text-sm px-2 py-1 rounded-full', exerciseCategories[categoryId].color)}>
          {exerciseCategories[categoryId].name}
        </span>
      );
    }
    
    // Fallback to a placeholder
    return (
      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-800">
        Loading...
      </span>
    );
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

  return (
    <>
      <Navbar />
      <PageContainer>
        <PageHeader
          title={`${workout.name}`}
          description={`Get ready to crush it! ${workout.description || ''}`}
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
                <span className="text-2xl font-semibold">{workout.exercises.length}</span>
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

        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {workout.exercises.map((exercise, index) => {
              const exerciseSets = exercise.sets;
              const completedSets = exerciseSets.filter(set => set.completed).length;
              const exerciseProgress = Math.round((completedSets / exerciseSets.length) * 100);
              
              return (
                <Button
                  key={exercise.id}
                  variant={currentExerciseIndex === index ? "default" : "outline"}
                  className="whitespace-nowrap"
                  onClick={() => handleNavigateToExercise(index)}
                >
                  {exercise.exercise.name}
                  {exerciseProgress === 100 && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8 mb-8">
          {workout.exercises.map((exerciseItem, exerciseIndex) => (
            <Card 
              key={exerciseItem.id} 
              id={`exercise-${exerciseIndex}`}
              className={`overflow-hidden transition-all duration-300 ${
                currentExerciseIndex === exerciseIndex ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="bg-muted/30 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div 
                    className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-cover bg-center flex-shrink-0" 
                    style={{ backgroundImage: `url(${exerciseItem.exercise.imageUrl})` }}
                  />
                  
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold flex items-center">
                      {exerciseItem.exercise.name}
                      {exerciseItem.exercise.category && (
                        <span className="ml-2">
                          {getCategoryDisplay(exerciseItem.exercise.category)}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground mt-1">{exerciseItem.exercise.description}</p>
                    
                    <div className="mt-3">
                      <div className="bg-background rounded-md px-3 py-1 text-sm inline-flex items-center">
                        <span className="font-medium">{exerciseItem.sets.length} sets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 md:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium">Set</th>
                        <th className="pb-2 text-left font-medium">Previous</th>
                        <th className="pb-2 text-left font-medium">Weight (kg)</th>
                        <th className="pb-2 text-left font-medium">Target</th>
                        <th className="pb-2 text-left font-medium">Actual</th>
                        <th className="pb-2 text-left font-medium">Complete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseItem.sets.map((set, setIndex) => (
                        <tr key={set.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-medium">
                              {set.setNumber}
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {set.weight || 0}kg × {set.targetReps}
                          </td>
                          <td className="py-4">
                            <Input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) => handleWeightChange(exerciseIndex, setIndex, e.target.value)}
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="py-4 font-medium text-center">
                            {set.targetReps}
                          </td>
                          <td className="py-4">
                            <Input
                              type="number"
                              value={set.actualReps !== undefined ? set.actualReps : ''}
                              onChange={(e) => handleActualRepsChange(exerciseIndex, setIndex, e.target.value)}
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <div className={`p-1 rounded-md transition-all ${set.completed ? 'bg-green-100' : ''}`}>
                                <Checkbox
                                  id={`set-${exerciseIndex}-${setIndex}`}
                                  checked={set.completed}
                                  onCheckedChange={(checked) => 
                                    handleSetCompletion(exerciseIndex, setIndex, checked as boolean)
                                  }
                                  className="h-6 w-6 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
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
    </>
  );
};

export default WorkoutSession;
