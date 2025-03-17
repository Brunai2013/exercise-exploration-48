
import { Category } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useCategoryColors } from '@/hooks/useCategoryColors';

export const useCategoryData = () => {
  // Use the centralized hook for category data
  const { categories, isLoading, error } = useCategoryColors();
  
  // Create a map of category IDs to names for easy lookup
  const categoryMap: Record<string, string> = {};
  
  // Create a map of category IDs to color data
  const categoryColorMap: Record<string, {name: string, color: string}> = {};
  
  categories.forEach(category => {
    categoryMap[category.id] = category.name;
    categoryColorMap[category.id] = {
      name: category.name,
      color: category.color
    };
  });
  
  // Show error toast if categories loading fails and it's not the initial load
  if (error && !isLoading) {
    console.error('Error fetching categories:', error);
    toast({
      title: "Error",
      description: "Failed to load categories. Please try again.",
      variant: "destructive",
    });
  }
  
  return {
    categoryMap,
    categoryColorMap,
    categories,
    isLoading
  };
};
