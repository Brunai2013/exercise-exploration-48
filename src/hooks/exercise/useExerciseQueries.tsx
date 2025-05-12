
import { useQuery } from '@tanstack/react-query';
import { getAllExercises } from '@/lib/exercises';
import { getAllCategories } from '@/lib/categories';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initializeWithSeedData } from '@/lib/db';
import { defaultExercises } from '@/lib/defaultData';
import { defaultCategories } from '@/lib/defaultData';

export function useExerciseQueries() {
  const [initialized, setInitialized] = useState(false);
  
  // Try to initialize the local DB with default data if needed
  useEffect(() => {
    const initializeLocalDB = async () => {
      try {
        await initializeWithSeedData(defaultExercises, defaultCategories, []);
        console.log('Local DB initialized with seed data if needed');
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing local DB:', error);
        toast.error('Failed to initialize local database', { id: 'db-init-error' });
      }
    };
    
    initializeLocalDB();
  }, []);

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
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: initialized, // Only fetch once local DB is initialized
    onSettled: (data, error) => {
      if (error) {
        console.error('Failed to load exercises:', error);
        if (!data || data.length === 0) {
          toast.error('Failed to load exercises. Please check your connection.', {
            id: 'exercises-error',
            duration: 5000,
          });
        }
      }
    }
  });

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
    retry: 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    enabled: initialized, // Only fetch once local DB is initialized
    onSettled: (data, error) => {
      if (error) {
        console.error('Failed to load categories:', error);
        if (!data || data.length === 0) {
          toast.error('Failed to load categories. Please check your connection.', {
            id: 'categories-error',
            duration: 5000,
          });
        }
      }
    }
  });

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
