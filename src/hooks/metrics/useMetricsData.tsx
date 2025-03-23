import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO, isValid, isAfter, isBefore, subDays } from 'date-fns';
import { useCategoryColors } from '@/hooks/useCategoryColors';

// Types for different data structures
export interface MuscleGroupData {
  id: string;
  name: string;
  value: number;
  color: string;
  count: number;
  percentage: number;
}

export interface ExerciseProgressItem {
  id: string;
  exercise: string;
  category: string;
  date: string;
  weight: number;
  reps: number;
}

export interface FrequencyData {
  name: string;
  workouts: number;
  date: string;
}

export interface CategoryAnalysis {
  id: string;
  category: string;
  name: string;
  prediction: string;
  pastCount: number;
  futureCount: number;
  pastPercentage: number;
  futurePercentage: number;
  color: string;
  suggestion: 'increase' | 'decrease' | 'maintain';
}

export function useMetricsData(
  dateRange: { from: Date; to: Date },
  view: 'weekly' | 'monthly',
  refreshKey: number = 0
) {
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([]);
  const [exerciseData, setExerciseData] = useState<ExerciseProgressItem[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { categories } = useCategoryColors();
  
  // Validate date range to ensure from is before to
  const validDateRange = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      console.error('Invalid date range provided:', dateRange);
      return false;
    }
    
    // Ensure both dates are valid Date objects
    if (!(dateRange.from instanceof Date) || !(dateRange.to instanceof Date)) {
      console.error('Date range contains invalid Date objects:', dateRange);
      return false;
    }
    
    // Check if dates are valid according to date-fns
    if (!isValid(dateRange.from) || !isValid(dateRange.to)) {
      console.error('Date range contains invalid dates:', dateRange);
      return false;
    }
    
    // Check if from date is before to date
    if (isAfter(dateRange.from, dateRange.to)) {
      console.error('From date is after to date:', dateRange);
      return false;
    }
    
    return true;
  }, [dateRange]);

  // Fetch data whenever date range or view changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!validDateRange) {
        setIsLoading(false);
        setError('Invalid date range provided');
        console.error('Invalid date range, skipping data fetch');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Log date range for debugging
        console.log('Fetching data with date range:', {
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd')
        });
        
        // Fetch real workout data from Supabase between the dates
        // Modified query to fix the column issue
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select(`
            id,
            name,
            date,
            completed,
            workout_exercises(
              id,
              exercises(id, name, category)
            )
          `)
          .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
          .eq('completed', true)
          .order('date', { ascending: false });
        
        if (workoutError) {
          throw new Error(`Error fetching workout data: ${workoutError.message}`);
        }
        
        // Log fetched workout data
        console.log(`Fetched ${workoutData?.length || 0} workouts`);
        
        if (isMounted) {
          if (workoutData && workoutData.length > 0) {
            // Process actual workout data
            processMuscleGroupData(workoutData);
            processExerciseData(workoutData);
            processFrequencyData(workoutData, view);
            generateUpcomingAnalysis();
          } else {
            // Generate demo data if no real data available
            console.log('No real workout data found, generating demo data');
            generateDemoData();
          }
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching metrics data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error fetching data');
          // Still generate demo data even if there was an error
          generateDemoData();
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, [dateRange.from, dateRange.to, view, refreshKey, validDateRange, categories]);
  
  // Process workout data into muscle group statistics
  const processMuscleGroupData = (workoutData: any[]) => {
    try {
      const muscleGroups: Record<string, { count: number; name: string; id: string }> = {};
      
      // Count exercises by muscle group
      workoutData.forEach(workout => {
        if (workout.workout_exercises) {
          workout.workout_exercises.forEach((workoutExercise: any) => {
            const exercise = workoutExercise.exercises;
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
            }
          });
        }
      });
      
      // Convert to required format and add colors
      const processedData = Object.entries(muscleGroups).map(([id, data]) => {
        const category = categories.find(c => c.id === id);
        // Extract color from Tailwind class
        const colorMatch = category?.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
        const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1'; // Default to indigo if no match
        
        return {
          id,
          name: data.name,
          value: data.count,
          color,
          count: data.count,
          percentage: data.count / workoutData.length * 100
        };
      }).sort((a, b) => b.value - a.value);
      
      console.log('Processed muscle group data:', processedData.length);
      setMuscleGroupData(processedData);
    } catch (err) {
      console.error('Error processing muscle group data:', err);
      // Fallback to empty array
      setMuscleGroupData([]);
    }
  };
  
  // Process workout data into exercise progress
  const processExerciseData = (workoutData: any[]) => {
    try {
      const exerciseProgress: ExerciseProgressItem[] = [];
      
      workoutData.forEach(workout => {
        if (workout.workout_exercises) {
          workout.workout_exercises.forEach((workoutExercise: any) => {
            const exercise = workoutExercise.exercises;
            if (exercise && workoutExercise.exercise_sets) {
              workoutExercise.exercise_sets.forEach((set: any) => {
                if (set.weight && set.reps) {
                  exerciseProgress.push({
                    id: `${workoutExercise.id}-${exercise.id}-${set.weight}-${set.reps}`,
                    exercise: exercise.name,
                    category: exercise.category,
                    date: workout.date,
                    weight: set.weight,
                    reps: set.reps
                  });
                }
              });
            }
          });
        }
      });
      
      console.log('Processed exercise data:', exerciseProgress.length);
      setExerciseData(exerciseProgress);
    } catch (err) {
      console.error('Error processing exercise data:', err);
      // Fallback to empty array
      setExerciseData([]);
    }
  };
  
  // Process workout data into frequency statistics
  const processFrequencyData = (workoutData: any[], view: 'weekly' | 'monthly') => {
    try {
      // Group workouts by week or month
      const frequencyMap: Record<string, { count: number, date: string }> = {};
      
      workoutData.forEach(workout => {
        let period: string;
        const workoutDate = parseISO(workout.date);
        
        if (view === 'weekly') {
          // Format as 'YYYY-WW' (year and week number)
          const weekNumber = Math.ceil(workoutDate.getDate() / 7);
          period = `${format(workoutDate, 'yyyy')}-W${weekNumber}`;
        } else {
          // Format as 'YYYY-MM' (year and month)
          period = format(workoutDate, 'yyyy-MM');
        }
        
        if (!frequencyMap[period]) {
          frequencyMap[period] = { count: 0, date: workout.date };
        }
        frequencyMap[period].count++;
      });
      
      // Convert to required format
      const processedData = Object.entries(frequencyMap).map(([period, data]) => {
        const [year, subPeriod] = period.split('-');
        const displayName = view === 'weekly' 
          ? `Week ${subPeriod.substring(1)}` 
          : format(parseISO(data.date), 'MMM yyyy');
        
        return {
          name: displayName,
          workouts: data.count,
          date: data.date
        };
      }).sort((a, b) => {
        // Sort by date (ascending)
        return parseISO(a.date) > parseISO(b.date) ? 1 : -1;
      });
      
      console.log('Processed frequency data:', processedData.length);
      setFrequencyData(processedData);
    } catch (err) {
      console.error('Error processing frequency data:', err);
      // Fallback to empty array
      setFrequencyData([]);
    }
  };

  // Generate demo data when no real data is available
  const generateDemoData = () => {
    console.log('Generating demo data...');
    
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
    
    // Demo exercise data
    const exercises = [
      'Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Push-up',
      'Shoulder Press', 'Bicep Curl', 'Tricep Extension', 'Lat Pulldown', 'Leg Press',
      'Calf Raise', 'Leg Extension', 'Leg Curl', 'Dumbbell Row', 'Plank',
      'Lunge', 'Chest Fly', 'Lateral Raise', 'Face Pull', 'Shrug'
    ];
    
    // Generate demo exercise progress data
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
    
    // Generate frequency data based on view type
    const frequencyMap: Record<string, number> = {};
    const frequencyData: FrequencyData[] = [];
    
    // Use the same date range as exercise data
    for (let i = 0; i < daysBetween; i += 2) { // Every other day (workouts)
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Don't create dates in the future
      if (isAfter(currentDate, new Date())) continue;
      
      let period: string;
      
      if (view === 'weekly') {
        // Group by week
        const weekNumber = Math.ceil(currentDate.getDate() / 7);
        period = `Week ${weekNumber}`;
      } else {
        // Group by month
        period = format(currentDate, 'MMM yyyy');
      }
      
      if (!frequencyMap[period]) {
        frequencyMap[period] = 0;
      }
      frequencyMap[period]++;
      
      // Add to the frequency data array (overwriting previous entries for the same period)
      const existingIndex = frequencyData.findIndex(item => item.name === period);
      if (existingIndex >= 0) {
        frequencyData[existingIndex] = {
          name: period,
          workouts: frequencyMap[period],
          date: format(currentDate, 'yyyy-MM-dd')
        };
      } else {
        frequencyData.push({
          name: period,
          workouts: frequencyMap[period],
          date: format(currentDate, 'yyyy-MM-dd')
        });
      }
    }
    
    // Sort frequency data by date
    frequencyData.sort((a, b) => {
      return parseISO(a.date) > parseISO(b.date) ? 1 : -1;
    });
    
    // Generate upcoming workout analysis
    const upcomingAnalysis: CategoryAnalysis[] = [];
    for (let i = 0; i < 5; i++) {
      const randomCategoryIndex = Math.floor(Math.random() * categories.length);
      const category = categories[randomCategoryIndex];
      
      // Extract color from Tailwind class for consistent coloring
      const colorMatch = category.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
      const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1';
      
      upcomingAnalysis.push({
        id: `upcoming-${i}`,
        category: category.id,
        name: category.name,
        prediction: `${Math.floor(Math.random() * 30) + 70}%`,
        pastCount: Math.floor(Math.random() * 50) + 10,
        futureCount: Math.floor(Math.random() * 50) + 10,
        pastPercentage: Math.floor(Math.random() * 50) + 10,
        futurePercentage: Math.floor(Math.random() * 50) + 10,
        color,
        suggestion: ['increase', 'decrease', 'maintain'][Math.floor(Math.random() * 3)] as 'increase' | 'decrease' | 'maintain'
      });
    }
    
    console.log('Generated demo data successfully');
    setMuscleGroupData(muscleGroups);
    setExerciseData(exerciseProgress);
    setFrequencyData(frequencyData);
    setUpcomingWorkoutData(upcomingAnalysis);
  };

  // Generate upcoming workout analysis
  const generateUpcomingAnalysis = () => {
    // This would typically use ML or statistical analysis of past workouts
    // For now, we'll use placeholders
    const upcomingAnalysis: CategoryAnalysis[] = categories.slice(0, 5).map((category, index) => {
      // Extract color from Tailwind class for consistent coloring
      const colorMatch = category.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
      const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1';
      
      const suggestionOptions: ('increase' | 'decrease' | 'maintain')[] = ['increase', 'decrease', 'maintain'];
      const randomSuggestion = suggestionOptions[Math.floor(Math.random() * suggestionOptions.length)];
      
      return {
        id: `upcoming-${index}`,
        category: category.id,
        name: category.name,
        prediction: `${Math.floor(Math.random() * 30) + 70}%`,
        pastCount: Math.floor(Math.random() * 50) + 10,
        futureCount: Math.floor(Math.random() * 50) + 10,
        pastPercentage: Math.floor(Math.random() * 50) + 10,
        futurePercentage: Math.floor(Math.random() * 50) + 10,
        color,
        suggestion: randomSuggestion
      };
    });
    
    setUpcomingWorkoutData(upcomingAnalysis);
  };

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  };
}
