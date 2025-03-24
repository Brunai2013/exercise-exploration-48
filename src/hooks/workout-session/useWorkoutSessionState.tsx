
import { Workout } from '@/lib/types';
import { useExerciseGroups } from './useExerciseGroups';
import { useWorkoutProgress } from './useWorkoutProgress';
import { useExerciseState } from './useExerciseState';
import { useCategoryData } from './useCategoryData';
import { useExerciseSets } from '@/hooks/workout/useExerciseSets';

export const useWorkoutSessionState = (
  workout: Workout | null,
  setWorkout: React.Dispatch<React.SetStateAction<Workout | null>>
) => {
  // Hooks setup
  const exerciseGroupState = useExerciseGroups();
  
  const progressState = useWorkoutProgress(workout);
  
  const exerciseState = useExerciseState(workout, setWorkout);
  
  const { exerciseCategories } = useCategoryData(workout);
  
  const {
    handleAddSet,
    handleRemoveSet
  } = useExerciseSets(setWorkout);

  // Log the handlers to verify they exist
  console.log("WorkoutSession handlers:", {
    handleAddSetExists: !!handleAddSet,
    handleRemoveSetExists: !!handleRemoveSet,
    handleAddSet,
    handleRemoveSet
  });
  
  // Create a map of exercise IDs to their indices
  const exerciseIndexMap = exerciseState.createExerciseIndexMap();

  return {
    // Group state
    ...exerciseGroupState,
    
    // Progress state
    ...progressState,
    
    // Exercise state
    ...exerciseState,
    
    // Category data
    exerciseCategories,
    
    // Set management
    handleAddSet,
    handleRemoveSet,
    
    // Exercise index mapping
    exerciseIndexMap,
  };
};
