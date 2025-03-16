
import { useQuery } from '@tanstack/react-query';
import { getAllExercises, getAllCategories } from '@/lib/data';
import { useCallback } from 'react';
import { toast } from 'sonner';

export function useExerciseQueries() {
  // Fetch exercises using React Query
  const { 
    data: exercises = [], 
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
    failureCount: exerciseFailureCount
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: getAllExercises,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  // Show error toast if exercise loading fails, but only if we've had multiple failures
  if (exercisesError && exerciseFailureCount > 1) {
    toast.error(`Failed to load exercises: ${exercisesError.message}`, {
      id: 'exercises-error', // Prevents duplicate toasts
    });
    console.error('Failed to load exercises:', exercisesError);
  }

  // Fetch categories using React Query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
    failureCount: categoryFailureCount
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true
  });

  // Show error toast if categories loading fails, but only if we've had multiple failures
  if (categoriesError && categoryFailureCount > 1) {
    toast.error(`Failed to load categories: ${categoriesError.message}`, {
      id: 'categories-error', // Prevents duplicate toasts
    });
    console.error('Failed to load categories:', categoriesError);
  }

  // Function to reload all data
  const refreshAllData = useCallback(() => {
    toast.info('Refreshing data...', { id: 'refresh-data' });
    Promise.all([refetchExercises(), refetchCategories()])
      .then(() => toast.success('Data refreshed successfully', { id: 'refresh-data' }))
      .catch((error) => toast.error(`Refresh failed: ${error.message}`, { id: 'refresh-data' }));
  }, [refetchExercises, refetchCategories]);

  return {
    exercises,
    categories,
    exercisesLoading,
    categoriesLoading,
    exercisesError,
    categoriesError,
    refreshAllData
  };
}
