import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { getWorkoutById, addWorkout, updateWorkout, generateWorkoutId } from '@/lib/workouts';
import { Exercise, WorkoutExercise, ExerciseSet, Workout } from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Trash2, Plus, Save, ChevronLeft, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import { getAllExercises } from '@/lib/exercises';
import { getAllCategories } from '@/lib/data';

const WorkoutForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialDateParam = searchParams.get('date');
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    date: initialDateParam || format(new Date(), 'yyyy-MM-dd'),
    exercises: [],
    completed: false
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDateParam 
      ? parse(initialDateParam, 'yyyy-MM-dd', new Date()) 
      : new Date()
  );
  
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [exercisesData, categoriesData] = await Promise.all([
          getAllExercises(),
          getAllCategories()
        ]);
        
        const catMap: Record<string, string> = {};
        categoriesData.forEach(category => {
          catMap[category.id] = category.name;
        });
        
        setCategoryMap(catMap);
        setAvailableExercises(exercisesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load exercises and categories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchWorkout = async () => {
      if (id && id !== 'new') {
        try {
          setIsLoading(true);
          const existingWorkout = await getWorkoutById(id);
          if (existingWorkout) {
            setWorkout(existingWorkout);
            setSelectedDate(parse(existingWorkout.date, 'yyyy-MM-dd', new Date()));
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
          toast({
            title: "Error",
            description: "Failed to load workout. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchWorkout();
  }, [id]);
  
  useEffect(() => {
    if (selectedDate) {
      setWorkout(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    }
  }, [selectedDate]);
  
  useEffect(() => {
    const fetchFilteredExercises = async () => {
      if (searchTerm) {
        const allExercises = await getAllExercises();
        const filtered = allExercises.filter(exercise => 
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setAvailableExercises(filtered);
      } else {
        const exercises = await getAllExercises();
        setAvailableExercises(exercises);
      }
    };
    
    fetchFilteredExercises();
  }, [searchTerm]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkout(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddExercise = (exercise: Exercise) => {
    const isExerciseAdded = workout.exercises?.some(
      (ex) => ex.exerciseId === exercise.id
    );
    
    if (isExerciseAdded) {
      toast({
        title: "Exercise already added",
        description: `${exercise.name} is already in this workout.`,
        variant: "destructive",
      });
      return;
    }
    
    const defaultSets = Array.from({ length: 3 }, (_, i) => ({
      id: `set-${exercise.id}-${i+1}-${Date.now()}`,
      exerciseId: exercise.id,
      setNumber: i + 1,
      targetReps: 10,
      weight: 0,
      completed: false
    }));
    
    const workoutExercise: WorkoutExercise = {
      id: `workout-exercise-${Date.now()}`,
      exerciseId: exercise.id,
      exercise: exercise,
      sets: defaultSets,
      order: (workout.exercises?.length || 0) + 1
    };
    
    setWorkout(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), workoutExercise]
    }));
    
    setSearchTerm('');
  };
  
  const handleRemoveExercise = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.filter(ex => ex.exerciseId !== exerciseId)
    }));
  };
  
  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    setWorkout(prev => {
      const updatedExercises = [...(prev.exercises || [])];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: field === 'targetReps' || field === 'weight' ? parseInt(value) || 0 : value
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const handleAddSet = (exerciseIndex: number) => {
    setWorkout(prev => {
      const updatedExercises = [...(prev.exercises || [])];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const exerciseId = updatedExercises[exerciseIndex].exerciseId;
      
      const newSet: ExerciseSet = {
        id: `set-${exerciseId}-${currentSets.length+1}-${Date.now()}`,
        exerciseId,
        setNumber: currentSets.length + 1,
        targetReps: 10,
        weight: currentSets[currentSets.length - 1]?.weight || 0,
        completed: false
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: [...currentSets, newSet]
      };
      
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => {
      const updatedExercises = [...(prev.exercises || [])];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets.splice(setIndex, 1);
      
      updatedSets.forEach((set, idx) => {
        set.setNumber = idx + 1;
      });
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const saveWorkout = async () => {
    if (!workout.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a workout name",
        variant: "destructive",
      });
      return;
    }
    
    if (!(workout.exercises?.length ?? 0)) {
      toast({
        title: "Validation Error",
        description: "Please add at least one exercise",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const completeWorkout: Workout = {
        id: workout.id || generateWorkoutId(),
        name: workout.name || 'Untitled Workout',
        description: workout.description,
        date: workout.date || format(new Date(), 'yyyy-MM-dd'),
        exercises: workout.exercises || [],
        completed: workout.completed || false
      };
      
      if (id && id !== 'new') {
        await updateWorkout(completeWorkout);
        toast({
          title: "Success",
          description: "Workout updated successfully",
        });
      } else {
        await addWorkout(completeWorkout);
        toast({
          title: "Success",
          description: "Workout created successfully",
        });
      }
      
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return "Uncategorized";
    return categoryMap[categoryId] || "Uncategorized";
  };
  
  return (
    <>
      <Navbar />
      <PageContainer>
        <PageHeader 
          title={id === 'new' ? "Create Workout" : "Edit Workout"} 
          description="Plan your workout routine"
          action={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveWorkout} disabled={isSaving || isLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Workout
                  </>
                )}
              </Button>
            </div>
          }
        />
        
        {isLoading ? (
          <Card className="p-8">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading workout data...</span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Workout Name
                      </label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={workout.name} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Chest & Triceps"
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description (Optional)
                      </label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={workout.description || ''} 
                        onChange={handleInputChange} 
                        placeholder="Brief description of this workout..."
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Workout Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-white",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "EEEE, MMMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <h3 className="font-medium text-lg mb-4">Exercises</h3>
              
              {(workout.exercises?.length ?? 0) > 0 ? (
                <div className="space-y-6 mb-6">
                  {workout.exercises?.map((exerciseItem, exerciseIndex) => (
                    <Card key={exerciseItem.id} className="overflow-hidden">
                      <div className="bg-muted/30 p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="h-10 w-10 rounded bg-cover bg-center mr-3" 
                            style={{ backgroundImage: `url(${exerciseItem.exercise.imageUrl})` }}
                          />
                          <div>
                            <h4 className="font-medium">{exerciseItem.exercise.name}</h4>
                            <p className="text-xs text-muted-foreground">{getCategoryName(exerciseItem.exercise.category)}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveExercise(exerciseItem.exerciseId)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-5">Weight</div>
                          <div className="col-span-5">Reps</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {exerciseItem.sets.map((set, setIndex) => (
                          <div key={set.id} className="grid grid-cols-12 gap-2 mb-3 items-center">
                            <div className="col-span-1 text-center">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
                                {set.setNumber}
                              </span>
                            </div>
                            <div className="col-span-5">
                              <div className="flex items-center">
                                <Input 
                                  type="number" 
                                  value={set.weight || ''} 
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)} 
                                  className="h-9 bg-white" 
                                />
                                <span className="ml-2 text-sm text-muted-foreground">kg</span>
                              </div>
                            </div>
                            <div className="col-span-5">
                              <div className="flex items-center">
                                <Input 
                                  type="number" 
                                  value={set.targetReps} 
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'targetReps', e.target.value)} 
                                  className="h-9 bg-white" 
                                />
                                <span className="ml-2 text-sm text-muted-foreground">reps</span>
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                disabled={exerciseItem.sets.length <= 1}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => handleAddSet(exerciseIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Set
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="mb-6">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No exercises added yet. Search and add exercises from the panel on the right.</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <div className="sticky top-20">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Add Exercises</h3>
                    <Input 
                      placeholder="Search exercises..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-3 bg-white"
                    />
                    
                    <div className="max-h-[500px] overflow-y-auto">
                      {isLoading ? (
                        <p className="text-center text-muted-foreground py-4">Loading exercises...</p>
                      ) : availableExercises.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No exercises found</p>
                      ) : (
                        <div className="space-y-1">
                          {availableExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleAddExercise(exercise)}
                            >
                              <div 
                                className="h-10 w-10 rounded bg-cover bg-center mr-3" 
                                style={{ backgroundImage: `url(${exercise.imageUrl})` }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{getCategoryName(exercise.category)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
};

export default WorkoutForm;
