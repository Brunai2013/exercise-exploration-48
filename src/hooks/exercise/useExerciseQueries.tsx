
import { useQuery } from '@tanstack/react-query';
import { getAllExercises } from '@/lib/exercises';
import { getAllCategories } from '@/lib/categories';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initializeWithSeedData } from '@/lib/db';
import { defaultCategories } from '@/lib/defaultData';

export function useExerciseQueries() {
  const [initialized, setInitialized] = useState(false);
  
  // Try to initialize the local DB with default categories only (no exercises)
  useEffect(() => {
    const initializeLocalDB = async () => {
      try {
        await initializeWithSeedData([], defaultCategories, []);
        console.log('Local DB initialized with categories only');
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
    queryFn: async () => {
      console.log('🔄 QUERY - Fetching exercises via React Query...');
      const result = await getAllExercises();
      console.log('📊 QUERY RESULT - Exercises fetched:', {
        count: result.length,
        exercises: result.map(ex => ({ id: ex.id, name: ex.name }))
      });
      return result;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: initialized, // Only fetch once local DB is initialized
  });

  // Handle exercise error display separately to avoid type issues
  useEffect(() => {
    if (exercisesError) {
      console.error('Failed to load exercises:', exercisesError);
      toast.error('Failed to load exercises. No exercises found.', {
        id: 'exercises-error',
        duration: 5000,
      });
    }
  }, [exercisesError]);

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
  });

  // Handle category error display separately to avoid type issues
  useEffect(() => {
    if (categoriesError) {
      console.error('Failed to load categories:', categoriesError);
      toast.error('Failed to load categories. Falling back to local data.', {
        id: 'categories-error',
        duration: 5000,
      });
    }
  }, [categoriesError]);

  // Function to reload all data
  const refreshAllData = useCallback(() => {
    console.log('🔄 REFRESH - Manually refreshing all data...');
    toast.info('Refreshing data...', { id: 'refresh-data' });
    Promise.all([refetchExercises(), refetchCategories()])
      .then(() => {
        console.log('✅ REFRESH SUCCESS - Data refreshed successfully');
        toast.success('Data refreshed successfully', { id: 'refresh-data' });
      })
      .catch((error) => {
        console.error('❌ REFRESH FAILED - Refresh failed:', error);
        toast.error(`Refresh failed: ${error.message}`, { id: 'refresh-data' });
      });
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
