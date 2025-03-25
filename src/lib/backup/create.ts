
import { supabase } from '@/integrations/supabase/client';
import { BackupData, BackupResult } from './types';
import { getAllExercises } from '../exercises';
import { getAllCategories } from '../categories';
import { getAllWorkouts } from '../workout';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a comprehensive backup of all data in the database
 * and attempts to store it in Supabase. If that fails, returns the data for local download.
 */
export async function createExerciseBackup(): Promise<BackupResult | null> {
  try {
    // Get all data
    const exercises = await getAllExercises();
    const categories = await getAllCategories();
    const workouts = await getAllWorkouts();
    
    if (exercises.length === 0 && categories.length === 0 && workouts.length === 0) {
      toast.warning('No data to backup');
      return null;
    }
    
    // Create backup data object with schema version
    const backupData: BackupData = {
      exercises,
      categories,
      workouts,
      timestamp: new Date().toISOString(),
      version: '2.0.0', // Increment version to reflect comprehensive backup
      schemaVersion: '1.0.0' // Add schema version to track database structure
    };
    
    // Generate a file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `complete-backup-${timestamp}.json`;
    
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
      
      toast.success('Complete backup created successfully');
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
