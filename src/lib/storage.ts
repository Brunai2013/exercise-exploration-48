
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
    
    console.log('🔄 Uploading image to Supabase Storage:', {
      fileName,
      filePath,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Upload the file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('❌ Error uploading image:', uploadError);
      throw uploadError;
    }
    
    console.log('✅ Upload successful, data received:', data);
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 Generated public URL:', {
      path: filePath,
      publicUrl: urlData.publicUrl,
      fullUrlData: urlData
    });
    
    // Verify the image can be accessed
    try {
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      console.log('🔍 Image accessibility check:', {
        status: response.status,
        statusText: response.statusText,
        url: urlData.publicUrl
      });
    } catch (fetchError) {
      console.warn('⚠️ Could not verify image accessibility:', fetchError);
    }
    
    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('💥 Error in uploadExerciseImage:', error);
    throw error;
  }
};

export const deleteExerciseImage = async (filePath: string): Promise<void> => {
  try {
    // Extract the path without the bucket name, if present
    const pathParts = filePath.split('/');
    const actualPath = pathParts.length > 1 ? pathParts.slice(pathParts.length - 2).join('/') : filePath;
    
    console.log('🗑️ Deleting image from Supabase Storage:', actualPath);
    
    // Remove the file from Supabase Storage
    const { error } = await supabase.storage
      .from('exercise-images')
      .remove([actualPath]);
      
    if (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
    
    console.log('✅ Image deleted successfully');
  } catch (error) {
    console.error('💥 Error deleting image:', error);
    throw error;
  }
};

// Utility function to ensure we always have a full URL for storage paths
export const ensureFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  console.log('🔄 Processing image path:', imagePath);
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    console.log('✅ Already a full URL:', imagePath);
    return imagePath;
  }
  
  // If it's a storage path, convert it to a full URL
  if (imagePath.startsWith('exercises/')) {
    const { data } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(imagePath);
    
    console.log('🔗 Converted storage path to URL:', {
      originalPath: imagePath,
      publicUrl: data?.publicUrl
    });
    
    return data?.publicUrl || '';
  }
  
  console.log('⚠️ Unknown image path format:', imagePath);
  // Return the original path if it doesn't match any patterns
  return imagePath;
};

// Function to check if a URL is valid or not
export const isImageUrlValid = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      console.log('❌ No URL provided for validation');
      resolve(false);
      return;
    }
    
    console.log('🔍 Validating image URL:', url);
    
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image URL is valid:', url);
      resolve(true);
    };
    img.onerror = () => {
      console.log('❌ Image URL is invalid:', url);
      resolve(false);
    };
    img.src = url;
  });
};
