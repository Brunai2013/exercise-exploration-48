
import { useNavigate } from 'react-router-dom';
import { Workout } from '@/lib/types';
import { generateWorkoutId } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';

export const useDuplicateWorkout = () => {
  const navigate = useNavigate();
  
  const duplicateWorkout = (workout: Workout) => {
    try {
      // Create a copy of the workout with a new ID
      const duplicatedWorkout: Workout = {
        ...workout,
        id: generateWorkoutId(),
        name: `${workout.name} (Copy)`,
        date: '', // Empty date field to require user input
        completed: false, // Reset completion status
        progress: 0, // Reset progress
        archived: false, // Ensure it's not archived
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
