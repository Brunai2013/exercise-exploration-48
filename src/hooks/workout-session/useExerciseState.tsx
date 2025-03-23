
import { useState } from 'react';
import { Workout, WorkoutExercise } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export const useExerciseState = (workout: Workout | null, setWorkout: React.Dispatch<React.SetStateAction<Workout | null>>) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const handleSetCompletion = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    if (!workout) return;
    
    console.log(`Marking set ${setIndex} of exercise ${exerciseIndex} as ${completed ? 'completed' : 'not completed'}`);
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      // Create deep copies to avoid direct state mutation
      const updatedExercises = [...prevWorkout.exercises];
      
      // Safety check to ensure exercise exists
      if (!updatedExercises[exerciseIndex]) {
        console.error(`Exercise at index ${exerciseIndex} does not exist`);
        return prevWorkout;
      }
      
      const exerciseCopy = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...exerciseCopy.sets];
      
      // Safety check to ensure set exists
      if (!updatedSets[setIndex]) {
        console.error(`Set at index ${setIndex} does not exist for exercise ${exerciseIndex}`);
        return prevWorkout;
      }
      
      // Update the completed status
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        completed: completed
      };
      
      exerciseCopy.sets = updatedSets;
      updatedExercises[exerciseIndex] = exerciseCopy;
      
      // Play completion sound when a set is marked as completed
      if (completed) {
        playCompletionSound();
      }
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });
  };

  // Separate function for playing sound to avoid CSP issues
  const playCompletionSound = () => {
    try {
      const audio = new Audio();
      audio.src = '/completion-sound.mp3';
      audio.volume = 0.5;
      
      // Simple play without promise chains
      audio.play();
    } catch (error) {
      console.log('Audio error occurred');
    }
  };

  const handleWeightChange = (exerciseIndex: number, setIndex: number, weight: string) => {
    if (!workout) return;
    
    console.log(`Updating weight for set ${setIndex} of exercise ${exerciseIndex} to ${weight}`);
    
    // Parse weight value safely
    let weightValue: number | undefined = undefined;
    if (weight && weight.trim() !== '') {
      const parsed = parseFloat(weight);
      if (!isNaN(parsed)) {
        weightValue = parsed;
      }
    }
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      const updatedExercises = [...prevWorkout.exercises];
      
      // Safety check
      if (!updatedExercises[exerciseIndex]) return prevWorkout;
      
      const exerciseCopy = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...exerciseCopy.sets];
      
      // Safety check
      if (!updatedSets[setIndex]) return prevWorkout;
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        weight: weightValue
      };
      
      exerciseCopy.sets = updatedSets;
      updatedExercises[exerciseIndex] = exerciseCopy;
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });
  };

  const handleActualRepsChange = (exerciseIndex: number, setIndex: number, reps: string) => {
    if (!workout) return;
    
    console.log(`Updating actual reps for set ${setIndex} of exercise ${exerciseIndex} to ${reps}`);
    
    // Parse reps value safely
    let repsValue: number | undefined = undefined;
    if (reps && reps.trim() !== '') {
      const parsed = parseInt(reps, 10);
      if (!isNaN(parsed)) {
        repsValue = parsed;
      }
    }
    
    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      
      const updatedExercises = [...prevWorkout.exercises];
      
      // Safety check
      if (!updatedExercises[exerciseIndex]) return prevWorkout;
      
      const exerciseCopy = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...exerciseCopy.sets];
      
      // Safety check
      if (!updatedSets[setIndex]) return prevWorkout;
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        actualReps: repsValue
      };
      
      exerciseCopy.sets = updatedSets;
      updatedExercises[exerciseIndex] = exerciseCopy;
      
      return {
        ...prevWorkout,
        exercises: updatedExercises
      };
    });
  };

  const handleNavigateToExercise = (index: number) => {
    console.log(`Navigating to exercise ${index}`);
    setCurrentExerciseIndex(index);
    
    // Safer DOM manipulation with document.getElementById instead of querySelector
    window.setTimeout(() => {
      try {
        const element = document.getElementById(`exercise-${index}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          console.log(`Could not find element with id exercise-${index}`);
        }
      } catch (error) {
        console.error('Error scrolling to element:', error);
      }
    }, 100);
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
