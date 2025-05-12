
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import * as localDB from '@/lib/db';
import { defaultCategories } from '@/lib/defaultData';

/**
 * Hook for accessing category colors with real-time updates and offline fallback
 */
export function useCategoryColors() {
  const queryClient = useQueryClient();
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  
  // Fetch categories with forced refetch to ensure fresh data
  const { 
    data: onlineCategories = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['category-colors'],
    queryFn: async () => {
      try {
        console.log('Attempting to fetch categories from Supabase...');
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching categories from Supabase:', error);
          throw new Error(`Failed to fetch category colors: ${error.message}`);
        }
        
        console.log('Successfully loaded categories from Supabase:', data?.length || 0);
        return data.map(cat => ({
          ...cat,
          color: cat.color || 'bg-gray-200 text-gray-700' // Ensure default color
        })) as Category[];
      } catch (error) {
        console.error('Failed to fetch categories from Supabase, falling back to local DB:', error);
        throw error;
      }
    },
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  
  // Load local categories on mount and when supabase fetch fails
  useEffect(() => {
    const loadLocalCategories = async () => {
      try {
        const categories = await localDB.getAllCategories();
        console.log('Loaded categories from local DB:', categories?.length || 0);
        if (categories && categories.length > 0) {
          setLocalCategories(categories);
        } else {
          // If no local categories, use default ones
          console.log('No local categories found, using defaults');
          setLocalCategories(defaultCategories);
          // Also save default categories to local DB
          for (const category of defaultCategories) {
            await localDB.saveCategory(category);
          }
        }
      } catch (err) {
        console.error('Error loading local categories:', err);
        setLocalCategories(defaultCategories);
      }
    };
    
    // Only load local categories if online fetch failed
    if (error) {
      loadLocalCategories();
    }
  }, [error]);
  
  // Force refresh on mount to ensure we have the latest data
  useEffect(() => {
    refetch();
    
    // Listen for changes to categories table
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories' 
      }, () => {
        // Invalidate queries when the categories table changes
        queryClient.invalidateQueries({ queryKey: ['category-colors'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        refetch();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, refetch]);
  
  // Use online categories if available, otherwise fallback to local
  const categories = error ? localCategories : onlineCategories;
  
  // Get category color by ID with fresh data
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'bg-gray-200 text-gray-700';
  };
  
  // Get full category by ID with fresh data
  const getCategory = (categoryId: string): Category | undefined => {
    return categories.find(c => c.id === categoryId);
  };
  
  // Refresh categories data
  const refreshCategories = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['category-colors'] });
      await refetch();
    } catch (err) {
      console.error("Error refreshing category colors:", err);
      toast.error("Failed to refresh category data");
    }
  };
  
  return {
    categories,
    isLoading,
    error,
    getCategoryColor,
    getCategory,
    refreshCategories
  };
}

// Helper function to create a category color map
export function createCategoryColorMap(categories: Category[]): Record<string, string> {
  const colorMap: Record<string, string> = {};
  
  categories.forEach(category => {
    colorMap[category.id] = category.color || 'bg-gray-200 text-gray-700';
  });
  
  return colorMap;
}
