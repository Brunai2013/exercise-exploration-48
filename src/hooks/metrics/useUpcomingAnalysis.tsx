
import { useState, useEffect } from 'react';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { parseISO, isAfter, format } from 'date-fns';

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

export function useUpcomingAnalysis(rawWorkoutData: any[] = []) {
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const { categories } = useCategoryColors();
  
  // Process real workout data to find upcoming (future) workouts
  useEffect(() => {
    if (rawWorkoutData.length > 0) {
      processUpcomingWorkoutData(rawWorkoutData);
    } else {
      generateDemoUpcomingAnalysis();
    }
  }, [rawWorkoutData, categories]);
  
  const processUpcomingWorkoutData = (workoutsData: any[]) => {
    try {
      console.log('Processing upcoming workout data from', workoutsData.length, 'workouts');
      
      // Get today's date for comparison
      const today = new Date();
      
      // Filter workouts to only include those with future dates
      const futureWorkouts = workoutsData.filter(workout => {
        if (!workout.date) return false;
        const workoutDate = parseISO(workout.date);
        return isAfter(workoutDate, today);
      });
      
      console.log('Found', futureWorkouts.length, 'future workouts');
      
      if (futureWorkouts.length === 0) {
        // If no future workouts, generate demo data
        generateDemoUpcomingAnalysis();
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
        generateDemoUpcomingAnalysis();
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
      
      console.log('Generated analysis data for', analysisData.length, 'categories');
      setUpcomingWorkoutData(analysisData);
      
    } catch (error) {
      console.error('Error processing upcoming workout data:', error);
      // Fall back to demo data in case of error
      generateDemoUpcomingAnalysis();
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
    
    setUpcomingWorkoutData(upcomingAnalysis);
  };

  return { upcomingWorkoutData };
}
