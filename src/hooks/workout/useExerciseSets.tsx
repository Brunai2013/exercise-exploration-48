
import { ExerciseSet, Workout } from '@/lib/types';

export const useExerciseSets = (
  setWorkout: React.Dispatch<React.SetStateAction<Partial<Workout> | null>>
) => {
  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    setWorkout(prev => {
      if (!prev || !prev.exercises) return prev;
      
      // Validation checks
      if (exerciseIndex < 0 || exerciseIndex >= prev.exercises.length) {
        console.error("Cannot change set: Invalid exercise index", { 
          exerciseIndex, 
          exercisesLength: prev.exercises?.length 
        });
        return prev;
      }

      const exercise = prev.exercises[exerciseIndex];
      if (!exercise.sets || setIndex < 0 || setIndex >= exercise.sets.length) {
        console.error("Cannot change set: Invalid set index", { 
          setIndex, 
          setsLength: exercise.sets?.length || 0 
        });
        return prev;
      }

      const updatedExercises = [...(prev.exercises)];
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
      if (!prev || !prev.exercises) return prev;
      
      // Make sure we have exercises
      if (exerciseIndex < 0 || exerciseIndex >= prev.exercises.length) {
        console.error("Cannot add set: Invalid exercise index", { 
          exerciseIndex, 
          exercisesLength: prev.exercises?.length 
        });
        return prev; // Return unchanged state if invalid
      }
      
      const updatedExercises = [...prev.exercises];
      const exercise = updatedExercises[exerciseIndex];
      const currentSets = exercise.sets || [];
      const exerciseId = exercise.exerciseId;
      
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
        ...exercise,
        sets: [...currentSets, newSet]
      };
      
      console.log("Added new set:", {
        exerciseIndex, 
        exerciseName: exercise.exercise?.name,
        setsCount: updatedExercises[exerciseIndex].sets.length
      });
      
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => {
      if (!prev || !prev.exercises) return prev;
      
      // Validate inputs
      if (exerciseIndex < 0 || exerciseIndex >= prev.exercises.length) {
        console.error("Cannot remove set: Invalid exercise index", { 
          exerciseIndex, 
          exercisesLength: prev.exercises?.length
        });
        return prev; // Return unchanged state if invalid
      }
      
      const exercise = prev.exercises[exerciseIndex];
      if (!exercise.sets || setIndex < 0 || setIndex >= exercise.sets.length) {
        console.error("Cannot remove set: Invalid set index", { 
          setIndex,
          setsLength: exercise.sets?.length || 0
        });
        return prev; // Return unchanged state if invalid
      }
      
      const updatedExercises = [...prev.exercises];
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
