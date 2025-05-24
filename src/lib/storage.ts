
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
    
    console.log('🔄 UPLOAD STARTING - Uploading image to Supabase Storage:', {
      originalFileName: file.name,
      newFileName: fileName,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });
    
    // Upload the file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('❌ UPLOAD FAILED - Error uploading image:', uploadError);
      throw uploadError;
    }
    
    console.log('✅ UPLOAD SUCCESS - Upload successful, data received:', {
      uploadData: data,
      uploadPath: data?.path,
      timestamp: new Date().toISOString()
    });
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 URL GENERATION - Generated public URL:', {
      requestedPath: filePath,
      publicUrl: urlData.publicUrl,
      fullUrlData: urlData,
      timestamp: new Date().toISOString()
    });
    
    // Verify the image can be accessed immediately
    try {
      console.log('🔍 TESTING URL - Testing image accessibility...');
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      console.log('📊 URL TEST RESULT - Image accessibility check:', {
        status: response.status,
        statusText: response.statusText,
        url: urlData.publicUrl,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        console.warn('⚠️ URL NOT ACCESSIBLE - Image URL returned non-200 status:', {
          status: response.status,
          url: urlData.publicUrl
        });
      }
    } catch (fetchError) {
      console.error('💥 URL TEST FAILED - Could not verify image accessibility:', {
        error: fetchError,
        url: urlData.publicUrl,
        timestamp: new Date().toISOString()
      });
    }
    
    const result = {
      path: filePath,
      url: urlData.publicUrl
    };
    
    console.log('🎯 UPLOAD COMPLETE - Final result:', {
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    console.error('💥 UPLOAD ERROR - Error in uploadExerciseImage:', {
      error,
      fileName: file.name,
      timestamp: new Date().toISOString()
    });
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
  if (!imagePath) {
    console.log('⚠️ EMPTY PATH - No image path provided');
    return '';
  }
  
  console.log('🔄 URL PROCESSING - Processing image path:', {
    originalPath: imagePath,
    pathType: imagePath.startsWith('http') ? 'Full URL' : 'Storage Path'
  });
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    console.log('✅ ALREADY FULL URL - Path is already a complete URL:', imagePath);
    return imagePath;
  }
  
  // If it's a storage path, convert it to a full URL
  if (imagePath.startsWith('exercises/')) {
    const { data } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(imagePath);
    
    console.log('🔗 PATH CONVERTED - Storage path converted to full URL:', {
      originalPath: imagePath,
      publicUrl: data?.publicUrl,
      timestamp: new Date().toISOString()
    });
    
    return data?.publicUrl || '';
  }
  
  // Handle case where path might be just a filename (this is likely the bug)
  if (!imagePath.includes('/')) {
    console.warn('🚨 FILENAME ONLY - Path appears to be just a filename, attempting to construct full path:', imagePath);
    const fullPath = `exercises/${imagePath}`;
    const { data } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(fullPath);
    
    console.log('🔧 FILENAME FIXED - Constructed full URL from filename:', {
      originalFilename: imagePath,
      constructedPath: fullPath,
      publicUrl: data?.publicUrl,
      timestamp: new Date().toISOString()
    });
    
    return data?.publicUrl || '';
  }
  
  console.warn('⚠️ UNKNOWN FORMAT - Unknown image path format, returning as-is:', imagePath);
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
