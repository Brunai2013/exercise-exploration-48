
import { useState, useEffect } from 'react';
import { getCategoryById } from '@/lib/categories';
import { Workout } from '@/lib/types';

export const useCategoryData = (workout: Workout | null) => {
  const [exerciseCategories, setExerciseCategories] = useState<Record<string, {name: string, color: string}>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      if (!workout) return;
      
      const categories: Record<string, {name: string, color: string}> = {};
      for (const exercise of workout.exercises) {
        if (exercise.exercise.category) {
          try {
            const category = await getCategoryById(exercise.exercise.category);
            if (category) {
              categories[exercise.exercise.category] = {
                name: category.name,
                color: category.color
              };
            }
          } catch (error) {
            console.error(`Error fetching category for exercise ${exercise.exercise.name}:`, error);
          }
        }
      }
      setExerciseCategories(categories);
    };

    fetchCategories();
  }, [workout]);
  
  return {
    exerciseCategories
  };
};
