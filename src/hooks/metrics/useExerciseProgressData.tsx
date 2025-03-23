
import { useState, useEffect } from 'react';
import { differenceInDays, format, isAfter, parseISO } from 'date-fns';
import { useCategoryColors } from '@/hooks/useCategoryColors';

export interface ExerciseProgressItem {
  id: string;
  exercise: string;
  category: string;
  date: string;
  weight: number;
  reps: number;
}

export function useExerciseProgressData(
  rawWorkoutData: any[],
  shouldUseDemoData: boolean,
  dateRange: { from: Date; to: Date }
) {
  const [exerciseData, setExerciseData] = useState<ExerciseProgressItem[]>([]);
  const { categories } = useCategoryColors();
  
  // Process workout data into exercise progress statistics
  useEffect(() => {
    if (!shouldUseDemoData && rawWorkoutData.length > 0) {
      processRealExerciseData(rawWorkoutData);
    } else if (shouldUseDemoData) {
      generateDemoExerciseData();
    }
  }, [rawWorkoutData, shouldUseDemoData, dateRange, categories]);
  
  // Process real workout data
  const processRealExerciseData = (workoutData: any[]) => {
    try {
      console.log('Processing real exercise data from', workoutData.length, 'workouts');
      const exerciseProgress: ExerciseProgressItem[] = [];
      
      workoutData.forEach(workout => {
        if (!workout.date) {
          console.warn('Workout missing date:', workout.id);
          return;
        }
        
        // Process workout exercises
        if (workout.workout_exercises && Array.isArray(workout.workout_exercises)) {
          workout.workout_exercises.forEach((exerciseEntry: any) => {
            // Process sets for this exercise
            if (exerciseEntry.exercise_sets && Array.isArray(exerciseEntry.exercise_sets)) {
              exerciseEntry.exercise_sets.forEach((set: any) => {
                // Make sure we have an exercise and valid data
                if (exerciseEntry.exercises && set.weight !== undefined && set.reps !== undefined) {
                  const exercise = exerciseEntry.exercises;
                  
                  exerciseProgress.push({
                    id: `${workout.id}-${exerciseEntry.id}-${set.id || Math.random().toString(36).substr(2, 9)}`,
                    exercise: exercise.name,
                    category: exercise.category,
                    date: workout.date,
                    weight: parseFloat(set.weight) || 0,
                    reps: parseInt(set.reps) || 0
                  });
                }
              });
            }
          });
        }
      });
      
      console.log(`Processed ${exerciseProgress.length} exercise data points from real workouts`);
      
      // Sort by date (oldest first)
      exerciseProgress.sort((a, b) => {
        return parseISO(a.date) > parseISO(b.date) ? 1 : -1;
      });
      
      setExerciseData(exerciseProgress);
    } catch (err) {
      console.error('Error processing real exercise data:', err);
      // Fall back to demo data in case of error
      generateDemoExerciseData();
    }
  };
  
  const generateDemoExerciseData = () => {
    // Demo exercise data
    const exercises = [
      'Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Push-up',
      'Shoulder Press', 'Bicep Curl', 'Tricep Extension', 'Lat Pulldown', 'Leg Press',
      'Calf Raise', 'Leg Extension', 'Leg Curl', 'Dumbbell Row', 'Plank',
      'Lunge', 'Chest Fly', 'Lateral Raise', 'Face Pull', 'Shrug'
    ];
    
    const exerciseProgress: ExerciseProgressItem[] = [];
    
    // Use the actual date range for the demo data
    const startDate = dateRange.from;
    const endDate = dateRange.to;
    const daysBetween = differenceInDays(endDate, startDate) + 1;
    
    // Check if we have categories available
    if (!categories || categories.length === 0) {
      console.warn('No categories available for generating demo data');
      setExerciseData([]);
      return;
    }
    
    // Get categories with appropriate IDs (use only the first 5 or fewer if not enough)
    const availableCategories = categories.slice(0, Math.min(5, categories.length));
    
    for (let i = 0; i < daysBetween; i += 2) { // Every other day
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Don't create dates in the future
      if (isAfter(currentDate, new Date())) continue;
      
      // Add 3-5 exercises per workout day
      const exercisesPerDay = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < exercisesPerDay; j++) {
        const randomExerciseIndex = Math.floor(Math.random() * exercises.length);
        // Make sure we have at least one category
        if (availableCategories.length === 0) {
          console.warn('No available categories for demo data generation');
          continue;
        }
        const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
        
        // Add 3-5 sets per exercise
        const setsPerExercise = Math.floor(Math.random() * 3) + 3;
        
        for (let k = 0; k < setsPerExercise; k++) {
          exerciseProgress.push({
            id: `demo-${i}-${j}-${k}`,
            exercise: exercises[randomExerciseIndex],
            category: availableCategories[randomCategoryIndex]?.id || 'default',
            date: format(currentDate, 'yyyy-MM-dd'),
            weight: Math.floor(Math.random() * 100) + 50, // 50-150 lbs
            reps: Math.floor(Math.random() * 8) + 5 // 5-12 reps
          });
        }
      }
    }
    
    setExerciseData(exerciseProgress);
  };

  return { exerciseData };
}
