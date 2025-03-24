
import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useParams, useSearchParams } from 'react-router-dom';
import { Workout } from '@/lib/types';
import { getWorkoutById } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';

// Interface for exercise grouping (visual only, not stored in database)
export interface ExerciseGroup {
  id: string;
  type: 'superset' | 'circuit';
  exerciseIds: string[];
}

export const useWorkoutFormState = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialDateParam = searchParams.get('date');
  const isDuplicate = searchParams.get('duplicate') === 'true';
  
  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    date: initialDateParam || (isDuplicate ? '' : format(new Date(), 'yyyy-MM-dd')),
    exercises: [],
    completed: false
  });
  
  // State for visual exercise grouping (not stored in database)
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDateParam 
      ? parse(initialDateParam, 'yyyy-MM-dd', new Date()) 
      : isDuplicate ? undefined : new Date()
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchWorkout = async () => {
      if (id && id !== 'new') {
        try {
          setIsLoading(true);
          const existingWorkout = await getWorkoutById(id);
          if (existingWorkout) {
            console.log("Loaded existing workout:", {
              id: existingWorkout.id,
              name: existingWorkout.name,
              exerciseCount: existingWorkout.exercises?.length,
              setCount: existingWorkout.exercises?.reduce((count, ex) => count + (ex.sets?.length || 0), 0)
            });
            
            // Ensure each exercise has an initialized sets array
            if (existingWorkout.exercises) {
              existingWorkout.exercises = existingWorkout.exercises.map(exercise => ({
                ...exercise,
                sets: Array.isArray(exercise.sets) ? exercise.sets : []
              }));
            }
            
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
      } else if (isDuplicate) {
        // Check for duplicated workout in localStorage
        try {
          const duplicatedWorkoutStr = localStorage.getItem('duplicated_workout');
          if (duplicatedWorkoutStr) {
            const duplicatedWorkout = JSON.parse(duplicatedWorkoutStr);
            console.log("Loaded duplicated workout:", {
              id: duplicatedWorkout.id,
              name: duplicatedWorkout.name,
              exerciseCount: duplicatedWorkout.exercises?.length,
              setCount: duplicatedWorkout.exercises?.reduce((count, ex) => count + (ex.sets?.length || 0), 0)
            });
            
            // Ensure the workout has valid exercises and sets
            if (duplicatedWorkout.exercises) {
              duplicatedWorkout.exercises = duplicatedWorkout.exercises.map(exercise => ({
                ...exercise,
                sets: Array.isArray(exercise.sets) ? exercise.sets : []
              }));
            }
            
            setWorkout(duplicatedWorkout);
            // Don't set the date - leave it blank to require user input
            setSelectedDate(undefined);
            // Clear the localStorage item to prevent reuse
            localStorage.removeItem('duplicated_workout');
          }
        } catch (error) {
          console.error('Error loading duplicated workout:', error);
          toast({
            title: "Error",
            description: "Failed to load duplicated workout.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id, isDuplicate]);
  
  useEffect(() => {
    if (selectedDate) {
      setWorkout(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    } else if (workout.date) {
      // Clear the date field if selectedDate is undefined
      setWorkout(prev => ({ ...prev, date: '' }));
    }
  }, [selectedDate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkout(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to create a new exercise group
  const createExerciseGroup = (exerciseIds: string[], type: 'superset' | 'circuit') => {
    const newGroup: ExerciseGroup = {
      id: `group-${Date.now()}`,
      type,
      exerciseIds
    };
    
    setExerciseGroups(prev => [...prev, newGroup]);
  };
  
  // Function to remove an exercise group
  const removeExerciseGroup = (groupId: string) => {
    setExerciseGroups(prev => prev.filter(group => group.id !== groupId));
  };
  
  // Function to update an exercise group
  const updateExerciseGroup = (
    groupId: string, 
    updates: Partial<Omit<ExerciseGroup, 'id'>>
  ) => {
    setExerciseGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, ...updates } 
          : group
      )
    );
  };
  
  return {
    id,
    workout,
    setWorkout,
    selectedDate,
    setSelectedDate,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    handleInputChange,
    // Exercise grouping functions
    exerciseGroups,
    setExerciseGroups,
    createExerciseGroup,
    removeExerciseGroup,
    updateExerciseGroup
  };
};
