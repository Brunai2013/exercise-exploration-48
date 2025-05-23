
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
    
    // Get the public URL for the file using the configured Supabase client
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

// Get the current correct Supabase URL from the configured client
const getCurrentSupabaseUrl = (): string => {
  const { data } = supabase.storage
    .from('exercise-images')
    .getPublicUrl('test');
  
  // Extract the base URL from the test URL
  const url = new URL(data.publicUrl);
  return `${url.protocol}//${url.host}`;
};

// List of known incorrect domains that need to be corrected
const INCORRECT_DOMAINS = [
  'dmmlcayednczwbojdhqs.supabase.co',
  'muchlcaupervmqgwlspk.supabase.co' // Even this might be wrong in some cases
];

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
  
  // If it's already a full URL, check if it needs domain correction
  if (imagePath.startsWith('http')) {
    const url = new URL(imagePath);
    const currentCorrectUrl = getCurrentSupabaseUrl();
    const correctUrl = new URL(currentCorrectUrl);
    
    // Check if the domain needs to be corrected
    if (INCORRECT_DOMAINS.some(domain => url.host.includes(domain)) || url.host !== correctUrl.host) {
      console.warn('🚨 WRONG DOMAIN - URL needs domain correction:', {
        originalUrl: imagePath,
        originalDomain: url.host,
        correctDomain: correctUrl.host
      });
      
      // Extract the path from the URL and regenerate with correct domain
      const pathMatch = imagePath.match(/\/exercises\/[^?]+/);
      if (pathMatch) {
        const correctPath = pathMatch[0].substring(1); // Remove leading slash
        const { data } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(correctPath);
        
        console.log('🔧 DOMAIN CORRECTED - Fixed URL domain:', {
          originalUrl: imagePath,
          extractedPath: correctPath,
          correctedUrl: data?.publicUrl,
          timestamp: new Date().toISOString()
        });
        
        return data?.publicUrl || '';
      }
    }
    
    console.log('✅ ALREADY CORRECT URL - Path is already a correct URL:', imagePath);
    return imagePath;
  }
  
  // If it's a storage path, convert it to a full URL using the configured Supabase client
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
  
  // Handle case where path might be just a filename
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

// Function to correct and save URLs to database
export const correctAndSaveImageUrl = (originalUrl: string): string => {
  const correctedUrl = ensureFullImageUrl(originalUrl);
  console.log('🔄 URL CORRECTION - Correcting URL for database save:', {
    originalUrl,
    correctedUrl,
    timestamp: new Date().toISOString()
  });
  return correctedUrl;
};
