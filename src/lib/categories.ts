
import { supabase } from '@/integrations/supabase/client';
import { Category } from './types';
import { v4 as uuidv4 } from 'uuid';

// Clear cache on each function call to ensure we don't use stale data
const categoryCache: Record<string, Category> = {};

// CATEGORY FUNCTIONS
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    // Clear cache to ensure we get fresh data
    Object.keys(categoryCache).forEach(key => delete categoryCache[key]);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message);
    }
    
    // Ensure all categories have the new color format and store in cache
    return data.map(cat => {
      const category = {
        ...cat,
        color: cat.color || 'bg-[#8B5CF6] text-white'
      };
      
      // Update cache with this fresh data
      categoryCache[cat.id] = category;
      return category;
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  try {
    // Clear cache to ensure fresh data
    Object.keys(categoryCache).forEach(key => delete categoryCache[key]);
    
    const newCategory = {
      id: uuidv4(),
      ...category,
      color: category.color || 'bg-[#8B5CF6] text-white' // Ensure color is set
    };
    
    const { error } = await supabase
      .from('categories')
      .insert([newCategory]);
    
    if (error) {
      console.error('Error adding category:', error);
      throw new Error(error.message);
    }
    
    // Update the cache with the new category
    categoryCache[newCategory.id] = newCategory;
    
    return newCategory;
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
};

export const updateCategory = async (category: Category): Promise<void> => {
  try {
    // Clear cache to ensure fresh data
    Object.keys(categoryCache).forEach(key => delete categoryCache[key]);
    
    // Ensure color is set
    const updatedCategory = {
      ...category,
      color: category.color || 'bg-[#8B5CF6] text-white'
    };
    
    const { error } = await supabase
      .from('categories')
      .update({
        name: updatedCategory.name,
        color: updatedCategory.color
      })
      .eq('id', updatedCategory.id);
    
    if (error) {
      console.error('Error updating category:', error);
      throw new Error(error.message);
    }
    
    // Update the cache with the updated category
    categoryCache[updatedCategory.id] = updatedCategory;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // Clear cache to ensure fresh data
    Object.keys(categoryCache).forEach(key => delete categoryCache[key]);
    
    // Update exercises that use this category to have no category
    const { error: updateError } = await supabase
      .from('exercises')
      .update({ category: null })
      .eq('category', id);
    
    if (updateError) {
      console.error('Error updating exercises with category:', updateError);
      throw new Error(updateError.message);
    }
    
    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      throw new Error(error.message);
    }
    
    // Remove from cache
    delete categoryCache[id];
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};

export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    // Always fetch from database to ensure fresh data
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    
    if (data) {
      // Store in cache with proper color format
      const category: Category = {
        id: data.id,
        name: data.name,
        color: data.color || 'bg-[#8B5CF6] text-white' // Ensure color is set properly
      };
      categoryCache[categoryId] = category;
      return category;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return null;
  }
};

export const getCategoryByIdSync = (categoryId: string): Category => {
  // If we have this category in our cache, return it
  if (categoryCache[categoryId]) {
    return categoryCache[categoryId];
  }
  
  // Return a placeholder until async data loads
  return { 
    id: categoryId, 
    name: 'Loading...', 
    color: 'bg-[#8B5CF6] text-white' // Default to vibrant purple
  };
};
