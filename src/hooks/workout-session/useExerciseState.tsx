
import { useState } from 'react';
import { Workout, WorkoutExercise } from '@/lib/types';

export const useExerciseState = (workout: Workout | null, setWorkout: React.Dispatch<React.SetStateAction<Workout | null>>) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

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

  const handleNavigateToExercise = (index: number) => {
    setCurrentExerciseIndex(index);
    document.getElementById(`exercise-${index}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const createExerciseIndexMap = (): Record<string, number> => {
    if (!workout) return {};
    
    return workout.exercises.reduce((map, exercise, index) => {
      map[exercise.id] = index;
      return map;
    }, {} as Record<string, number>);
  };
  
  return {
    currentExerciseIndex,
    handleSetCompletion,
    handleWeightChange,
    handleActualRepsChange,
    handleNavigateToExercise,
    createExerciseIndexMap
  };
};
