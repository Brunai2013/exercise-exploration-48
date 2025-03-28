
import { useState, useEffect } from 'react';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { parseISO, isAfter, isBefore, format, addDays, startOfDay, endOfDay } from 'date-fns';

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
  futureWorkoutDates?: string[]; // Add this to track actual workout dates
}

export function useUpcomingAnalysis(
  rawWorkoutData: any[] = [],
  shouldUseDemoData: boolean = true,
  futureDays: number = 7 // Parameter to control future window
) {
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const { categories } = useCategoryColors();
  
  // Process real workout data to find upcoming (future) workouts
  useEffect(() => {
    if (rawWorkoutData.length > 0) {
      processUpcomingWorkoutData(rawWorkoutData, futureDays);
    } else if (shouldUseDemoData) {
      // Only generate demo data if shouldUseDemoData is true
      console.log('Using demo data for upcoming analysis with', futureDays, 'days window');
      generateDemoUpcomingAnalysis();
    } else {
      console.log('No workout data available and not using demo data for upcoming analysis');
      // Return empty array when no workouts and not using demo data
      setUpcomingWorkoutData([]);
    }
  }, [rawWorkoutData, categories, shouldUseDemoData, futureDays]); 
  
  const processUpcomingWorkoutData = (workoutsData: any[], days: number) => {
    try {
      console.log('Processing upcoming workout data from', workoutsData.length, 'workouts with', days, 'day window');
      
      // Get today's date for comparison - use start of day for consistent comparison
      const today = startOfDay(new Date());
      // Calculate end date of window (today + X days)
      const futureWindow = endOfDay(addDays(today, days - 1)); // Subtract 1 to include today in the count
      
      console.log('Future window:', {
        today: format(today, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(futureWindow, 'yyyy-MM-dd HH:mm:ss')
      });
      
      // Log all workout dates for debugging
      workoutsData.forEach(workout => {
        if (workout.date) {
          const workoutDate = parseISO(workout.date);
          console.log('Workout:', workout.name, 'date:', format(workoutDate, 'yyyy-MM-dd'), 
            'isAfter today:', isAfter(workoutDate, today) || format(workoutDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'), 
            'isBefore window end:', isBefore(workoutDate, futureWindow) || format(workoutDate, 'yyyy-MM-dd') === format(futureWindow, 'yyyy-MM-dd'),
            'would be included:', (isAfter(workoutDate, today) || format(workoutDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) 
              && (isBefore(workoutDate, futureWindow) || format(workoutDate, 'yyyy-MM-dd') === format(futureWindow, 'yyyy-MM-dd'))
          );
        }
      });
      
      // Filter workouts to only include those with dates in the future window
      const futureWorkouts = workoutsData.filter(workout => {
        if (!workout.date) return false;
        
        // Parse the date and set to beginning of day for consistent comparison
        const workoutDate = startOfDay(parseISO(workout.date));
        const todayFormatted = format(today, 'yyyy-MM-dd');
        const workoutFormatted = format(workoutDate, 'yyyy-MM-dd');
        const windowFormatted = format(futureWindow, 'yyyy-MM-dd');
        
        // Check if workout is after today (or today) and before end of future window (or on end date)
        const isOnOrAfterToday = workoutFormatted >= todayFormatted;
        const isOnOrBeforeWindow = workoutFormatted <= windowFormatted;
        
        return isOnOrAfterToday && isOnOrBeforeWindow;
      });
      
      console.log('Found', futureWorkouts.length, 'future workouts within', days, 'day window');
      futureWorkouts.forEach(workout => {
        console.log('Future workout:', workout.name, 'date:', workout.date);
      });
      
      if (futureWorkouts.length === 0) {
        if (shouldUseDemoData) {
          // Only generate demo data if shouldUseDemoData is true
          console.log('No future workouts found in window, using demo data for upcoming analysis');
          generateDemoUpcomingAnalysis();
        } else {
          console.log('No future workouts found in window and not using demo data');
          setUpcomingWorkoutData([]);
        }
        return;
      }
      
      // Count exercises by category
      const categoryExerciseCounts: Record<string, number> = {};
      const categoryNames: Record<string, string> = {};
      const categoryWorkoutDates: Record<string, Set<string>> = {}; // Track unique workout dates per category
      let totalExerciseCount = 0;
      
      // Process each future workout
      futureWorkouts.forEach(workout => {
        console.log('Processing future workout:', workout.name, 'with', 
          workout.workout_exercises?.length || 0, 'exercises', 'date:', workout.date);
          
        if (workout.workout_exercises && Array.isArray(workout.workout_exercises)) {
          workout.workout_exercises.forEach((exerciseEntry: any) => {
            const exercise = exerciseEntry.exercises;
            if (exercise && exercise.category) {
              // Initialize if first time seeing this category
              if (!categoryExerciseCounts[exercise.category]) {
                categoryExerciseCounts[exercise.category] = 0;
                categoryNames[exercise.category] = getCategoryName(exercise.category, categories);
                categoryWorkoutDates[exercise.category] = new Set();
              }
              
              // Count this exercise for the category
              categoryExerciseCounts[exercise.category]++;
              totalExerciseCount++;
              
              // Add workout date to this category's set of dates
              if (workout.date) {
                categoryWorkoutDates[exercise.category].add(workout.date);
              }
              
              console.log('Found exercise:', exercise.name, 'category:', 
                categoryNames[exercise.category], 'count:', categoryExerciseCounts[exercise.category]);
            }
          });
        }
      });
      
      console.log('Total exercise count across all future workouts:', totalExerciseCount);
      
      // If we didn't find any exercises with categories, generate demo data
      if (totalExerciseCount === 0) {
        if (shouldUseDemoData) {
          console.log('No exercises with categories found in future workouts, using demo data');
          generateDemoUpcomingAnalysis();
        } else {
          console.log('No exercises with categories and not using demo data');
          setUpcomingWorkoutData([]);
        }
        return;
      }
      
      // Collect all unique workout dates for frequency chart
      const allWorkoutDates = new Set<string>();
      futureWorkouts.forEach(workout => {
        if (workout.date) {
          allWorkoutDates.add(workout.date);
        }
      });
      
      console.log('All unique workout dates:', [...allWorkoutDates]);
      
      // Create formatted data for analysis
      const analysisData: CategoryAnalysis[] = Object.entries(categoryExerciseCounts).map(
        ([categoryId, count]) => {
          // Calculate percentage of total
          const percentage = Math.round((count / totalExerciseCount) * 100);
          
          // Get color from categories if available
          const categoryColor = getCategoryColor(categoryId, categories);
          
          // Convert Set to Array for the dates
          const workoutDates = [...categoryWorkoutDates[categoryId]];
          
          // Determine a suggested action based on past vs future counts
          const pastCount = Math.floor(Math.random() * 10) + 5; // Simple placeholder for past data
          const pastPercentage = Math.floor(Math.random() * 30) + 10;
          
          let suggestion: 'increase' | 'decrease' | 'maintain';
          const ratio = percentage / pastPercentage;
          if (ratio < 0.8) suggestion = 'increase';
          else if (ratio > 1.2) suggestion = 'decrease';
          else suggestion = 'maintain';
          
          return {
            id: `upcoming-${categoryId}`,
            category: categoryId,
            name: categoryNames[categoryId] || categoryId,
            prediction: `${percentage}%`,
            pastCount,
            futureCount: count,
            pastPercentage,
            futurePercentage: percentage,
            color: categoryColor,
            suggestion,
            futureWorkoutDates: [...allWorkoutDates] // Add all unique workout dates for frequency chart
          };
        }
      );
      
      // Sort by count (highest first)
      analysisData.sort((a, b) => b.futureCount - a.futureCount);
      
      console.log('Generated analysis data for', analysisData.length, 'categories within', days, 'day window');
      setUpcomingWorkoutData(analysisData);
      
    } catch (error) {
      console.error('Error processing upcoming workout data:', error);
      if (shouldUseDemoData) {
        // Only fall back to demo data if shouldUseDemoData is true
        console.log('Error processing data, falling back to demo data for upcoming analysis');
        generateDemoUpcomingAnalysis();
      } else {
        console.log('Error processing data and not using demo data');
        setUpcomingWorkoutData([]);
      }
    }
  };
  
  // Utility functions to get category information
  const getCategoryName = (categoryId: string, categoriesData: any[]): string => {
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  const getCategoryColor = (categoryId: string, categoriesData: any[]): string => {
    const category = categoriesData.find(cat => cat.id === categoryId);
    if (category && category.color) {
      // Extract color from Tailwind class for consistent coloring
      const colorMatch = category.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
      return colorMatch ? `#${colorMatch[1]}` : '#6366F1';
    }
    return '#6366F1'; // Default color
  };
  
  // Generate artificial/demo analysis for upcoming workouts
  const generateDemoUpcomingAnalysis = () => {
    // Filter out empty or invalid categories
    const validCategories = categories.filter(category => category && category.id);
    
    if (!validCategories || validCategories.length === 0) {
      console.warn('No valid categories available for generating demo data');
      setUpcomingWorkoutData([]);
      return;
    }
    
    // This would typically use ML or statistical analysis of past workouts
    const upcomingAnalysis: CategoryAnalysis[] = validCategories.slice(0, Math.min(6, validCategories.length)).map((category, index) => {
      // Extract color from Tailwind class for consistent coloring
      const colorMatch = category.color.match(/bg-\[#([A-Fa-f0-9]+)\]/);
      const color = colorMatch ? `#${colorMatch[1]}` : '#6366F1';
      
      const suggestionOptions: ('increase' | 'decrease' | 'maintain')[] = ['increase', 'decrease', 'maintain'];
      const randomSuggestion = suggestionOptions[Math.floor(Math.random() * suggestionOptions.length)];
      
      // Generate random but plausible data
      const futureCount = Math.floor(Math.random() * 5) + 1;
      const futurePercentage = Math.floor(Math.random() * 30) + 10;
      
      // Generate some demo workout dates for the frequency chart
      const today = new Date();
      const demoDates: string[] = [];
      for (let i = 0; i < futureDays; i++) {
        if (Math.random() > 0.7) { // 30% chance of having a workout on this day
          const date = addDays(today, i);
          demoDates.push(format(date, 'yyyy-MM-dd'));
        }
      }
      
      return {
        id: `upcoming-${index}`,
        category: category.id,
        name: category.name,
        prediction: `${Math.floor(Math.random() * 30) + 70}%`,
        pastCount: Math.floor(Math.random() * 10) + 5,
        futureCount: futureCount,
        pastPercentage: Math.floor(Math.random() * 30) + 10,
        futurePercentage: futurePercentage,
        color,
        suggestion: randomSuggestion,
        futureWorkoutDates: demoDates
      };
    });
    
    console.log('Generated demo upcoming analysis data:', upcomingAnalysis.length);
    setUpcomingWorkoutData(upcomingAnalysis);
  };

  return { upcomingWorkoutData };
}
