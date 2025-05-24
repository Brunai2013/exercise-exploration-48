
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from './types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import * as localDB from './db';
import { defaultExercises } from './defaultData';
import { ensureFullImageUrl, correctAndSaveImageUrl } from './storage';

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
      
      // Process image URLs before saving to local DB
      const processedExercises = data.map(item => {
        // Always ensure the URL is corrected when loading from database
        let imageUrl = item.image_url || '';
        if (imageUrl) {
          imageUrl = ensureFullImageUrl(imageUrl);
          console.log('📸 EXERCISE LOAD - Corrected image URL on load:', {
            exerciseName: item.name,
            originalUrl: item.image_url,
            correctedUrl: imageUrl,
            timestamp: new Date().toISOString()
          });
        }
        
        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          category: item.category,
          imageUrl: imageUrl,
          imagePath: item.image_url || ''
        };
      });
      
      // Also save to local DB for offline use
      try {
        for (const exercise of processedExercises) {
          await localDB.saveExercise(exercise);
        }
        console.log('Exercises saved to local DB for offline use');
      } catch (saveError) {
        console.error('Error saving exercises to local DB:', saveError);
      }
      
      return processedExercises;
    } else {
      console.warn('No exercises found in Supabase');
      return []; // Return empty array instead of throwing error
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
        console.warn('No exercises found in local storage either');
        return []; // Return empty array instead of default exercises
      }
    } catch (localError) {
      console.error('Failed to fetch from local DB too:', localError);
      return []; // Return empty array instead of default exercises
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
    
    // Correct the image URL when loading single exercise
    let imageUrl = data.image_url || '';
    if (imageUrl) {
      imageUrl = ensureFullImageUrl(imageUrl);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.category,
      imageUrl: imageUrl
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
    // Always correct the image URL before saving to database
    const correctedImageUrl = exercise.imageUrl ? correctAndSaveImageUrl(exercise.imageUrl) : '';
    
    console.log('💾 EXERCISE ADD - Adding exercise with corrected URL:', {
      exerciseName: exercise.name,
      originalUrl: exercise.imageUrl,
      correctedUrl: correctedImageUrl,
      timestamp: new Date().toISOString()
    });
    
    const { error } = await supabase
      .from('exercises')
      .insert([{
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        image_url: correctedImageUrl
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
    
    const formattedExercises = exercises.map(exercise => {
      // Correct image URLs for all exercises before bulk insert
      const correctedImageUrl = exercise.imageUrl ? correctAndSaveImageUrl(exercise.imageUrl) : '';
      
      console.log('💾 BULK ADD - Correcting URL for bulk insert:', {
        exerciseName: exercise.name,
        originalUrl: exercise.imageUrl,
        correctedUrl: correctedImageUrl
      });
      
      return {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        image_url: correctedImageUrl
      };
    });
    
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
    // Always correct the image URL before updating in database
    const correctedImageUrl = exercise.imageUrl ? correctAndSaveImageUrl(exercise.imageUrl) : '';
    
    console.log('💾 EXERCISE UPDATE - Updating exercise with corrected URL:', {
      exerciseName: exercise.name,
      exerciseId: exercise.id,
      originalUrl: exercise.imageUrl,
      correctedUrl: correctedImageUrl,
      timestamp: new Date().toISOString()
    });
    
    const { error } = await supabase
      .from('exercises')
      .update({
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        image_url: correctedImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', exercise.id);
    
    if (error) {
      console.error('Error updating exercise:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ EXERCISE UPDATE SUCCESS - Exercise updated with corrected URL');
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

// New function to clear all exercises
export const clearAllExercises = async (): Promise<void> => {
  try {
    console.log('🗑️ CLEAR ALL - Starting to clear all exercises...');
    
    const { error } = await supabase
      .from('exercises')
      .delete()
      .neq('id', ''); // This will delete all rows
    
    if (error) {
      console.error('Error clearing all exercises:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ CLEAR ALL SUCCESS - All exercises cleared from database');
    toast.success('All exercises have been cleared from the database');
  } catch (error) {
    console.error('Error in clearAllExercises:', error);
    toast.error('Failed to clear exercises');
    throw error;
  }
};

// Function to bulk update all exercises with corrected URLs
export const bulkUpdateExerciseUrls = async (): Promise<void> => {
  try {
    console.log('🔄 BULK URL UPDATE - Starting bulk URL correction...');
    
    // Get all exercises
    const { data: exercises, error: fetchError } = await supabase
      .from('exercises')
      .select('*');
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found to update');
      return;
    }
    
    let updatedCount = 0;
    
    // Update each exercise with corrected URL
    for (const exercise of exercises) {
      if (exercise.image_url) {
        const correctedUrl = correctAndSaveImageUrl(exercise.image_url);
        
        if (correctedUrl !== exercise.image_url) {
          console.log('🔧 BULK UPDATE - Correcting URL for exercise:', {
            exerciseName: exercise.name,
            originalUrl: exercise.image_url,
            correctedUrl: correctedUrl
          });
          
          const { error: updateError } = await supabase
            .from('exercises')
            .update({ image_url: correctedUrl })
            .eq('id', exercise.id);
          
          if (updateError) {
            console.error('Error updating exercise URL:', updateError);
          } else {
            updatedCount++;
          }
        }
      }
    }
    
    console.log(`✅ BULK UPDATE COMPLETE - Updated ${updatedCount} exercise URLs`);
    toast.success(`Updated ${updatedCount} exercise image URLs`);
  } catch (error) {
    console.error('Error in bulk URL update:', error);
    toast.error('Failed to update exercise URLs');
    throw error;
  }
};
