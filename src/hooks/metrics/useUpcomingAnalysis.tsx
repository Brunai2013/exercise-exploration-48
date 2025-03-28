
import { useState, useEffect } from 'react';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { parseISO, isAfter, isBefore, format, addDays } from 'date-fns';

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

export function useUpcomingAnalysis(
  rawWorkoutData: any[] = [],
  shouldUseDemoData: boolean = true,
  futureDays: number = 7 // New parameter to control future window
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
  }, [rawWorkoutData, categories, shouldUseDemoData, futureDays]); // Add futureDays to dependency array
  
  const processUpcomingWorkoutData = (workoutsData: any[], days: number) => {
    try {
      console.log('Processing upcoming workout data from', workoutsData.length, 'workouts with', days, 'day window');
      
      // Get today's date for comparison
      const today = new Date();
      // Calculate end date of window (today + X days)
      const futureWindow = addDays(today, days);
      
      console.log('Future window:', {
        today: format(today, 'yyyy-MM-dd'),
        endDate: format(futureWindow, 'yyyy-MM-dd')
      });
      
      // Filter workouts to only include those with dates in the future window
      const futureWorkouts = workoutsData.filter(workout => {
        if (!workout.date) return false;
        const workoutDate = parseISO(workout.date);
        return isAfter(workoutDate, today) && isBefore(workoutDate, futureWindow);
      });
      
      console.log('Found', futureWorkouts.length, 'future workouts within', days, 'day window');
      
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
      let totalExerciseCount = 0;
      
      // Process each future workout
      futureWorkouts.forEach(workout => {
        if (workout.workout_exercises && Array.isArray(workout.workout_exercises)) {
          workout.workout_exercises.forEach((exerciseEntry: any) => {
            const exercise = exerciseEntry.exercises;
            if (exercise && exercise.category) {
              // Initialize if first time seeing this category
              if (!categoryExerciseCounts[exercise.category]) {
                categoryExerciseCounts[exercise.category] = 0;
                categoryNames[exercise.category] = getCategoryName(exercise.category, categories);
              }
              
              // Count this exercise for the category
              categoryExerciseCounts[exercise.category]++;
              totalExerciseCount++;
            }
          });
        }
      });
      
      // If we didn't find any exercises with categories, generate demo data
      if (totalExerciseCount === 0) {
        if (shouldUseDemoData) {
          generateDemoUpcomingAnalysis();
        } else {
          setUpcomingWorkoutData([]);
        }
        return;
      }
      
      // Create formatted data for analysis
      const analysisData: CategoryAnalysis[] = Object.entries(categoryExerciseCounts).map(
        ([categoryId, count], index) => {
          // Calculate percentage of total
          const percentage = Math.round((count / totalExerciseCount) * 100);
          
          // Get color from categories if available
          const categoryColor = getCategoryColor(categoryId, categories);
          
          // Randomly determine a suggested action
          const suggestionOptions: ('increase' | 'decrease' | 'maintain')[] = ['increase', 'decrease', 'maintain'];
          const randomSuggestion = suggestionOptions[Math.floor(Math.random() * suggestionOptions.length)];
          
          return {
            id: `upcoming-${categoryId}`,
            category: categoryId,
            name: categoryNames[categoryId] || categoryId,
            prediction: `${percentage}%`,
            pastCount: Math.floor(Math.random() * 50) + 10, // Random past count
            futureCount: count,
            pastPercentage: Math.floor(Math.random() * 50) + 10, // Random past percentage
            futurePercentage: percentage,
            color: categoryColor,
            suggestion: randomSuggestion
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
      const futureCount = Math.floor(Math.random() * 50) + 10;
      const futurePercentage = Math.floor(Math.random() * 30) + 10;
      
      return {
        id: `upcoming-${index}`,
        category: category.id,
        name: category.name,
        prediction: `${Math.floor(Math.random() * 30) + 70}%`,
        pastCount: Math.floor(Math.random() * 50) + 10,
        futureCount: futureCount,
        pastPercentage: Math.floor(Math.random() * 50) + 10,
        futurePercentage: futurePercentage,
        color,
        suggestion: randomSuggestion
      };
    });
    
    console.log('Generated demo upcoming analysis data:', upcomingAnalysis.length);
    setUpcomingWorkoutData(upcomingAnalysis);
  };

  return { upcomingWorkoutData };
}
