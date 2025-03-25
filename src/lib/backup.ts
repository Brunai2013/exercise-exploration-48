import { supabase } from '@/integrations/supabase/client';
import { Exercise, Category } from './types';
import { getAllExercises } from './exercises';
import { getAllCategories } from './categories';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for backup data
 */
interface BackupData {
  exercises: Exercise[];
  categories: Category[];
  timestamp: string;
  version: string;
}

/**
 * Creates a backup of all exercises and categories in the database
 * and attempts to store it in Supabase. If that fails, returns the data for local download.
 */
export async function createExerciseBackup(): Promise<{ path?: string, data?: BackupData, fileName?: string } | null> {
  try {
    // Get all exercises and categories
    const exercises = await getAllExercises();
    const categories = await getAllCategories();
    
    if (exercises.length === 0 && categories.length === 0) {
      toast.warning('No data to backup');
      return null;
    }
    
    // Create backup data object
    const backupData: BackupData = {
      exercises,
      categories,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Generate a file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `exercise-backup-${timestamp}.json`;
    
    // Convert data to JSON
    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    
    try {
      // Try to upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('exercise_backups')
        .upload(fileName, file);
        
      if (error) {
        console.error('Error uploading backup to Supabase:', error);
        
        // If RLS error, provide the data for local download instead
        if (error.message.includes('violates row-level security policy')) {
          toast.info('Storage policy prevents server backup - creating local backup instead');
          return { 
            data: backupData, 
            fileName 
          };
        } else {
          toast.error(`Backup failed: ${error.message}`);
          return null;
        }
      }
      
      toast.success('Exercise data backup created successfully');
      return { path: data.path };
    } catch (error) {
      console.error('Storage error:', error);
      // Fallback to local backup
      toast.info('Creating local backup instead');
      return { 
        data: backupData, 
        fileName 
      };
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    toast.error(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Lists all available backups in the storage bucket
 */
export async function listExerciseBackups(): Promise<{ name: string; path: string; created_at: string }[]> {
  try {
    const { data, error } = await supabase.storage
      .from('exercise_backups')
      .list();
      
    if (error) {
      console.error('Error listing backups:', error);
      toast.error(`Failed to list backups: ${error.message}`);
      return [];
    }
    
    return data
      .filter(item => !item.id.endsWith('/'))
      .map(item => ({
        name: item.name,
        path: item.name,
        created_at: item.created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error listing backups:', error);
    toast.error(`Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Downloads a backup file by its path
 */
export async function downloadExerciseBackup(path: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('exercise_backups')
      .download(path);
      
    if (error) {
      console.error('Error downloading backup:', error);
      toast.error(`Failed to download backup: ${error.message}`);
      return;
    }
    
    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'exercise-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Backup downloaded successfully');
  } catch (error) {
    console.error('Error downloading backup:', error);
    toast.error(`Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Restores exercises and categories from a backup
 * This is a destructive operation that will overwrite existing data
 */
export async function restoreFromBackup(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const backupData = JSON.parse(text) as BackupData;
    
    // Basic validation
    if (!backupData.exercises || !backupData.categories || !backupData.timestamp) {
      toast.error('Invalid backup file format');
      return false;
    }
    
    // Confirm with user - this would be handled by the UI component
    
    // Process categories first - ensure IDs are preserved
    for (const category of backupData.categories) {
      // Check if category exists
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category.id)
        .maybeSingle();
        
      if (existingCategory) {
        // Update existing category
        await supabase
          .from('categories')
          .update({
            name: category.name,
            color: category.color
          })
          .eq('id', category.id);
      } else {
        // Insert new category
        await supabase
          .from('categories')
          .insert([{
            id: category.id,
            name: category.name,
            color: category.color
          }]);
      }
    }
    
    // Process exercises
    for (const exercise of backupData.exercises) {
      // Check if exercise exists
      const { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .eq('id', exercise.id)
        .maybeSingle();
        
      if (existingExercise) {
        // Update existing exercise
        await supabase
          .from('exercises')
          .update({
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            image_url: exercise.imageUrl
          })
          .eq('id', exercise.id);
      } else {
        // Insert new exercise
        await supabase
          .from('exercises')
          .insert([{
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            image_url: exercise.imageUrl
          }]);
      }
    }
    
    toast.success('Backup restored successfully');
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    toast.error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Creates a local backup download when Supabase storage is unavailable
 */
export function downloadLocalBackup(data: BackupData, fileName: string): void {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Local backup downloaded successfully');
  } catch (error) {
    console.error('Error creating local backup:', error);
    toast.error(`Local backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
