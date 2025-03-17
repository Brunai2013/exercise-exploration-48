
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { useEffect } from 'react';

/**
 * Hook for accessing category colors with real-time updates
 */
export function useCategoryColors() {
  const queryClient = useQueryClient();
  
  // Fetch categories with forced refetch to ensure fresh data
  const { 
    data: categories = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['category-colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) {
        throw new Error(`Failed to fetch category colors: ${error.message}`);
      }
      
      return data.map(cat => ({
        ...cat,
        color: cat.color || 'bg-gray-200 text-gray-700' // Ensure default color
      })) as Category[];
    },
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
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
