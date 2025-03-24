
import { useNavigate } from 'react-router-dom';
import { Workout, ExerciseSet } from '@/lib/types';
import { generateWorkoutId } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';

export const useDuplicateWorkout = () => {
  const navigate = useNavigate();
  
  const duplicateWorkout = (workout: Workout) => {
    try {
      // First, ensure that we have a complete workout with valid exercises and sets
      if (!workout || !workout.exercises) {
        throw new Error("Cannot duplicate an invalid workout");
      }
      
      // Create duplicated exercise sets with new IDs
      const duplicatedExercises = workout.exercises.map(exercise => {
        // Ensure sets are initialized properly
        const duplicatedSets = (exercise.sets || []).map(set => {
          // Create a new set with a new ID but same properties
          const newSet: ExerciseSet = {
            ...set,
            id: `set-${exercise.exerciseId}-${set.setNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          };
          return newSet;
        });
        
        return {
          ...exercise,
          sets: duplicatedSets,
        };
      });
      
      // Create a copy of the workout with a new ID and duplicated exercises
      const duplicatedWorkout: Workout = {
        ...workout,
        id: generateWorkoutId(),
        name: `${workout.name} (Copy)`,
        date: '', // Empty date field to require user input
        completed: false, // Reset completion status
        progress: 0, // Reset progress
        archived: false, // Ensure it's not archived
        exercises: duplicatedExercises,
      };
      
      // Store the duplicated workout in localStorage for retrieval in the form
      localStorage.setItem('duplicated_workout', JSON.stringify(duplicatedWorkout));
      
      // Navigate to the workout form with the new ID
      navigate(`/workout/new?duplicate=true`);
      
      toast({
        title: "Workout Duplicated",
        description: "Edit the copy before saving",
      });
    } catch (error) {
      console.error('Error duplicating workout:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate workout",
        variant: "destructive",
      });
    }
  };
  
  return { duplicateWorkout };
};
