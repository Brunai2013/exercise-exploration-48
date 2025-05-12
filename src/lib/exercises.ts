import { supabase } from '@/integrations/supabase/client';
import { Exercise } from './types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import * as localDB from './db';
import { defaultExercises } from './defaultData';

// EXERCISE FUNCTIONS
export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    console.log('Attempting to fetch exercises from Supabase...');
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching exercises from Supabase:', error);
      throw new Error(error.message);
    }
    
    // Successfully got data from Supabase
    if (data && data.length > 0) {
      console.log('Successfully loaded exercises from Supabase:', data.length);
      
      // Also save to local DB for offline use
      try {
        for (const exercise of data) {
          await localDB.saveExercise({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description || '',
            category: exercise.category,
            imageUrl: exercise.image_url || ''
          });
        }
        console.log('Exercises saved to local DB for offline use');
      } catch (saveError) {
        console.error('Error saving exercises to local DB:', saveError);
      }
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        imageUrl: item.image_url || ''
      }));
    } else {
      console.warn('No exercises found in Supabase');
      throw new Error('No exercises found in Supabase');
    }
  } catch (error) {
    console.error('Failed to fetch from Supabase, falling back to local DB:', error);
    
    try {
      // Fallback to IndexedDB
      console.log('Attempting to fetch exercises from local DB...');
      const localExercises = await localDB.getAllExercises();
      
      if (localExercises && localExercises.length > 0) {
        console.log('Successfully loaded exercises from local DB:', localExercises.length);
        return localExercises;
      } else {
        console.warn('No exercises found in local storage either, using default data');
        
        // Use default exercises as last resort
        for (const exercise of defaultExercises) {
          await localDB.saveExercise(exercise);
        }
        
        return defaultExercises;
      }
    } catch (localError) {
      console.error('Failed to fetch from local DB too:', localError);
      return defaultExercises;
    }
  }
};

export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching exercise from Supabase:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.category,
      imageUrl: data.image_url || ''
    };
  } catch (error) {
    console.error('Failed to fetch from Supabase, falling back to local DB:', error);
    
    try {
      // Fallback to IndexedDB
      const localExercise = await localDB.getExerciseById(id);
      return localExercise || null;
    } catch (localError) {
      console.error('Failed to fetch from local DB too:', localError);
      return null;
    }
  }
};

export const addExercise = async (exercise: Exercise): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .insert([{
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        image_url: exercise.imageUrl
      }]);
    
    if (error) {
      console.error('Error adding exercise:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in addExercise:', error);
    throw error;
  }
};

export const addMultipleExercises = async (exercises: Exercise[]): Promise<void> => {
  try {
    if (exercises.length === 0) return;
    
    const formattedExercises = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      image_url: exercise.imageUrl
    }));
    
    const { error } = await supabase
      .from('exercises')
      .insert(formattedExercises);
    
    if (error) {
      console.error('Error adding exercises:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in addMultipleExercises:', error);
    throw error;
  }
};

export const updateExercise = async (exercise: Exercise): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .update({
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        image_url: exercise.imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', exercise.id);
    
    if (error) {
      console.error('Error updating exercise:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in updateExercise:', error);
    throw error;
  }
};

export const deleteExercise = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting exercise:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deleteExercise:', error);
    throw error;
  }
};
