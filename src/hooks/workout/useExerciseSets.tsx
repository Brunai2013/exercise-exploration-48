
import { ExerciseSet, Workout } from '@/lib/types';

export const useExerciseSets = (
  setWorkout: React.Dispatch<React.SetStateAction<Partial<Workout>>>
) => {
  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    setWorkout(prev => {
      // Validation checks
      if (!prev.exercises || !prev.exercises[exerciseIndex] || !prev.exercises[exerciseIndex].sets) {
        console.error("Cannot change set: Invalid exercise index or missing sets", { 
          exerciseIndex, 
          exercisesLength: prev.exercises?.length 
        });
        return prev;
      }

      const updatedExercises = [...(prev.exercises || [])];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      if (!updatedSets[setIndex]) {
        console.error("Cannot change set: Invalid set index", { setIndex, setsLength: updatedSets.length });
        return prev;
      }
      
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
      // Make sure we have exercises
      if (!prev.exercises || !prev.exercises.length || exerciseIndex >= prev.exercises.length) {
        console.error("Cannot add set: Invalid exercise index or no exercises", { 
          exerciseIndex, 
          exercisesLength: prev.exercises?.length 
        });
        return prev; // Return unchanged state if invalid
      }
      
      const updatedExercises = [...(prev.exercises || [])];
      const currentSets = updatedExercises[exerciseIndex].sets || [];
      const exerciseId = updatedExercises[exerciseIndex].exerciseId;
      
      if (!exerciseId) {
        console.error("Cannot add set: Missing exerciseId");
        return prev;
      }
      
      const newSet: ExerciseSet = {
        id: `set-${exerciseId}-${currentSets.length+1}-${Date.now()}`,
        exerciseId,
        setNumber: currentSets.length + 1,
        targetReps: 10,
        weight: currentSets.length > 0 ? (currentSets[currentSets.length - 1]?.weight || 0) : 0,
        completed: false
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: [...currentSets, newSet]
      };
      
      console.log("Added new set:", {
        exerciseIndex, 
        exerciseName: updatedExercises[exerciseIndex].exercise?.name,
        setsCount: updatedExercises[exerciseIndex].sets.length
      });
      
      // Fixed: only one return statement
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => {
      // Validate inputs
      if (!prev.exercises || !prev.exercises.length || 
          exerciseIndex >= prev.exercises.length ||
          !prev.exercises[exerciseIndex].sets ||
          setIndex >= prev.exercises[exerciseIndex].sets.length) {
        console.error("Cannot remove set: Invalid indexes", { 
          exerciseIndex, 
          setIndex,
          exercisesLength: prev.exercises?.length,
          setsLength: prev.exercises?.[exerciseIndex]?.sets?.length
        });
        return prev; // Return unchanged state if invalid
      }
      
      const updatedExercises = [...(prev.exercises || [])];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets.splice(setIndex, 1);
      
      // Renumber remaining sets
      updatedSets.forEach((set, idx) => {
        set.setNumber = idx + 1;
      });
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      console.log("Removed set:", {
        exerciseIndex, 
        setIndex,
        exerciseName: updatedExercises[exerciseIndex].exercise?.name,
        remainingSets: updatedSets.length
      });
      
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  return {
    handleSetChange,
    handleAddSet,
    handleRemoveSet
  };
};
