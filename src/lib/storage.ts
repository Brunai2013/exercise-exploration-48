
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadExerciseImage = async (
  file: File,
  folderName: string = 'exercises'
): Promise<{ path: string; url: string }> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;
    
    console.log('Uploading image to Supabase Storage:', filePath);
    
    // Upload the file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);
    
    console.log('Image uploaded successfully. Path:', filePath, 'URL:', urlData.publicUrl);
    
    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteExerciseImage = async (filePath: string): Promise<void> => {
  try {
    // Extract the path without the bucket name, if present
    const pathParts = filePath.split('/');
    const actualPath = pathParts.length > 1 ? pathParts.slice(pathParts.length - 2).join('/') : filePath;
    
    console.log('Deleting image from Supabase Storage:', actualPath);
    
    // Remove the file from Supabase Storage
    const { error } = await supabase.storage
      .from('exercise-images')
      .remove([actualPath]);
      
    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
    
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Utility function to ensure we always have a full URL for storage paths
export const ensureFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a storage path, convert it to a full URL
  if (imagePath.startsWith('exercises/')) {
    const { data } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(imagePath);
    
    return data?.publicUrl || '';
  }
  
  // Return the original path if it doesn't match any patterns
  return imagePath;
};

// Function to check if a URL is valid or not
export const isImageUrlValid = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
