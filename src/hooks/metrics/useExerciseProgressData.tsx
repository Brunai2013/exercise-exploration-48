
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
  
  // Generate exercise progress data
  useEffect(() => {
    if (shouldUseDemoData) {
      generateDemoExerciseData();
    } else {
      // In a real implementation, we would process the raw workout data here
      // For now, we'll use demo data since the real data processing is not implemented
      generateDemoExerciseData();
    }
  }, [rawWorkoutData, shouldUseDemoData, dateRange, categories]);
  
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
    
    // Get categories with appropriate IDs
    const availableCategories = categories.slice(0, 5);
    
    for (let i = 0; i < daysBetween; i += 2) { // Every other day
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Don't create dates in the future
      if (isAfter(currentDate, new Date())) continue;
      
      // Add 3-5 exercises per workout day
      const exercisesPerDay = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < exercisesPerDay; j++) {
        const randomExerciseIndex = Math.floor(Math.random() * exercises.length);
        const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
        
        // Add 3-5 sets per exercise
        const setsPerExercise = Math.floor(Math.random() * 3) + 3;
        
        for (let k = 0; k < setsPerExercise; k++) {
          exerciseProgress.push({
            id: `demo-${i}-${j}-${k}`,
            exercise: exercises[randomExerciseIndex],
            category: availableCategories[randomCategoryIndex].id,
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
