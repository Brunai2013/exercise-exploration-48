
import { Category } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';

export const useCategoryData = () => {
  // Use the centralized hook for category data
  const { categories, isLoading, error, refreshCategories } = useCategoryColors();
  const queryClient = useQueryClient();
  
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
  
  // Add new category
  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('categories')
        .insert(newCategory);
        
      if (error) throw error;
      
      await refreshCategories();
      toast({
        title: "Success",
        description: `Category "${categoryData.name}" has been created.`,
      });
      
      return true;
    } catch (err) {
      console.error('Error adding category:', err);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Update existing category
  const handleUpdateCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          color: category.color
        })
        .eq('id', category.id);
        
      if (error) throw error;
      
      await refreshCategories();
      toast({
        title: "Success",
        description: `Category "${category.name}" has been updated.`,
      });
      
      return true;
    } catch (err) {
      console.error('Error updating category:', err);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      // Also update any exercises using this category to have no category
      await supabase
        .from('exercises')
        .update({ category: null })
        .eq('category', categoryId);
      
      await refreshCategories();
      
      // Invalidate exercises query to refresh exercises with removed category
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      
      toast({
        title: "Success",
        description: "Category has been deleted.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
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
    isLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  };
};
