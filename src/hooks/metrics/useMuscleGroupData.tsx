
import { useState, useEffect } from 'react';
import { useCategoryColors } from '@/hooks/useCategoryColors';

export interface MuscleGroupData {
  id: string;
  name: string;
  value: number;
  color: string;
  count: number;
  percentage: number;
}

export function useMuscleGroupData(
  rawWorkoutData: any[],
  shouldUseDemoData: boolean,
  dateRange: { from: Date; to: Date }
) {
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([]);
  const { categories } = useCategoryColors();
  
  // Process workout data into muscle group statistics
  useEffect(() => {
    console.log('Processing muscle group data with:', {
      workoutCount: rawWorkoutData.length,
      useDemoData: shouldUseDemoData,
      dateRange: `${dateRange.from.toISOString()} to ${dateRange.to.toISOString()}`
    });
    
    if (!shouldUseDemoData && rawWorkoutData.length > 0) {
      processMuscleGroupData(rawWorkoutData);
    } else if (shouldUseDemoData) {
      console.log('Using demo data for muscle groups because shouldUseDemoData is true');
      generateDemoMuscleGroupData();
    } else {
      console.log('No workout data available and not using demo data');
      // Return empty data when no workouts and not using demo data
      setMuscleGroupData([]);
    }
  }, [rawWorkoutData, shouldUseDemoData, categories, dateRange]);
  
  const processMuscleGroupData = (workoutData: any[]) => {
    try {
      console.log('Raw workout data for muscle group processing:', workoutData);
      
      const muscleGroups: Record<string, { count: number; name: string; id: string }> = {};
      let totalExercises = 0;
      
      // Count exercises by muscle group
      workoutData.forEach(workout => {
        console.log(`Processing workout: ${workout.name} (${workout.date})`);
        
        if (workout.workout_exercises && Array.isArray(workout.workout_exercises)) {
          workout.workout_exercises.forEach((workoutExercise: any) => {
            if (workoutExercise.exercises) {
              const exercise = workoutExercise.exercises;
              console.log(`Found exercise: ${exercise.name}, category: ${exercise.category}`);
              
              if (exercise && exercise.category) {
                if (!muscleGroups[exercise.category]) {
                  const category = categories.find(c => c.id === exercise.category);
                  muscleGroups[exercise.category] = {
                    count: 0,
                    name: category?.name || 'Unknown',
                    id: exercise.category
                  };
                }
                muscleGroups[exercise.category].count++;
                totalExercises++;
              } else {
                console.warn('Exercise missing category information:', exercise);
              }
            } else {
              console.warn('Workout exercise missing exercises property:', workoutExercise);
            }
          });
        } else {
          console.warn('Workout missing workout_exercises array:', workout);
        }
      });
      
      // Convert to required format and add colors
      const processedData = Object.entries(muscleGroups).map(([id, data]) => {
        const category = categories.find(c => c.id === id);
        // Extract color from Tailwind class
        const colorMatch = category?.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
        const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1'; // Default to indigo if no match
        
        const percentage = totalExercises > 0 
          ? Math.round((data.count / totalExercises) * 100) 
          : 0;
        
        return {
          id,
          name: data.name,
          value: data.count,
          color,
          count: data.count,
          percentage
        };
      }).sort((a, b) => b.value - a.value);
      
      console.log('Processed real muscle group data:', processedData);
      setMuscleGroupData(processedData);
    } catch (err) {
      console.error('Error processing muscle group data:', err);
      // Fallback to empty array
      setMuscleGroupData([]);
    }
  };
  
  const generateDemoMuscleGroupData = () => {
    // Demo muscle group data with proper category IDs and names from categories
    const muscleGroups: MuscleGroupData[] = categories.slice(0, 6).map((category, index) => {
      // Extract color from Tailwind class
      const colorMatch = category.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
      const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1'; // Default to indigo if no match
      
      const count = Math.floor(Math.random() * 50) + 10; // Random value between 10-60
      
      return {
        id: category.id,
        name: category.name,
        value: count,
        color,
        count,
        percentage: Math.floor(Math.random() * 50) + 10
      };
    });
    
    console.log('Generated demo muscle group data:', muscleGroups);
    setMuscleGroupData(muscleGroups);
  };

  return { muscleGroupData };
}
