
import { useState, useEffect } from 'react';
import { useCategoryColors } from '@/hooks/useCategoryColors';

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

export function useUpcomingAnalysis() {
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const { categories } = useCategoryColors();
  
  // Generate artificial/demo analysis for upcoming workouts
  useEffect(() => {
    generateUpcomingAnalysis(categories);
  }, [categories]);
  
  const generateUpcomingAnalysis = (categoriesData: any[]) => {
    // This would typically use ML or statistical analysis of past workouts
    const upcomingAnalysis: CategoryAnalysis[] = categoriesData.slice(0, 5).map((category, index) => {
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

  return { upcomingWorkoutData };
}
