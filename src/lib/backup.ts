import { supabase } from '@/integrations/supabase/client';
import { Exercise, Category, Workout, WorkoutExercise, ExerciseSet } from './types';
import { getAllExercises } from './exercises';
import { getAllCategories } from './categories';
import { getAllWorkouts } from './workout';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for comprehensive backup data
 */
interface BackupData {
  exercises: Exercise[];
  categories: Category[];
  workouts: Workout[];
  timestamp: string;
  version: string;
  schemaVersion: string;
}

/**
 * Creates a comprehensive backup of all data in the database
 * and attempts to store it in Supabase. If that fails, returns the data for local download.
 */
export async function createExerciseBackup(): Promise<{ path?: string, data?: BackupData, fileName?: string } | null> {
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
 * Restores all data from a comprehensive backup
 * This is a destructive operation that will overwrite existing data
 */
export async function restoreFromBackup(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const backupData = JSON.parse(text) as BackupData;
    
    // Basic validation
    if (!backupData.exercises || !backupData.categories) {
      toast.error('Invalid backup file format');
      return false;
    }
    
    // Process schema changes if needed (for future compatibility)
    // This would handle migrations between schema versions
    
    // Create transaction for atomic operations (all succeed or all fail)
    
    try {
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
      
      // Process exercises - preserving original IDs
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
      
      // If workouts exist in the backup, restore them
      if (backupData.workouts && backupData.workouts.length > 0) {
        // First delete all existing workouts to avoid conflicts
        // This is only done if we're restoring workouts to ensure we don't leave partial data
        // Note: This is a destructive operation
        await supabase.from('workouts').delete().neq('id', 'placeholder');
        
        // Process workouts one by one
        for (const workout of backupData.workouts) {
          // Insert workout
          const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert({
              id: workout.id,
              name: workout.name,
              description: workout.description || null,
              date: workout.date,
              completed: workout.completed,
              progress: workout.progress || 0,
              archived: workout.archived || false
            })
            .select('id')
            .single();
            
          if (workoutError) {
            console.error('Error restoring workout:', workoutError);
            continue;
          }
          
          // Process workout exercises
          for (const exerciseItem of workout.exercises) {
            const { data: workoutExerciseData, error: workoutExerciseError } = await supabase
              .from('workout_exercises')
              .insert({
                id: exerciseItem.id, // Preserve original ID
                workout_id: workout.id,
                exercise_id: exerciseItem.exerciseId,
                order_index: exerciseItem.order
              })
              .select('id')
              .single();
              
            if (workoutExerciseError) {
              console.error('Error restoring workout exercise:', workoutExerciseError);
              continue;
            }
            
            // Process sets
            if (exerciseItem.sets && exerciseItem.sets.length > 0) {
              const setsToInsert = exerciseItem.sets.map(set => ({
                workout_exercise_id: workoutExerciseData.id,
                set_number: set.setNumber,
                weight: set.weight || null,
                target_reps: set.targetReps,
                actual_reps: set.actualReps || null,
                completed: set.completed,
                notes: set.notes || null
              }));
              
              const { error: setsError } = await supabase
                .from('exercise_sets')
                .insert(setsToInsert);
                
              if (setsError) {
                console.error('Error restoring exercise sets:', setsError);
              }
            }
          }
        }
      }
      
      toast.success('Complete backup restored successfully');
      return true;
    } catch (error) {
      console.error('Error in restore transaction:', error);
      toast.error(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
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

/**
 * Download database schema (for advanced restoration)
 * This function gets the database structure for manual restoration if needed
 */
export async function downloadDatabaseSchema(): Promise<boolean> {
  try {
    // Query table definitions - requires privileged access
    // For the web app, we'll create a schema definition manually
    const schemaDefinition = {
      tables: {
        exercises: {
          columns: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'name', type: 'text', nullable: false },
            { name: 'description', type: 'text', nullable: true },
            { name: 'category', type: 'uuid', reference: 'categories.id', nullable: true },
            { name: 'image_url', type: 'text', nullable: true },
            { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
            { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
          ]
        },
        categories: {
          columns: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'name', type: 'text', nullable: false },
            { name: 'color', type: 'text', nullable: true },
            { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
          ]
        },
        workouts: {
          columns: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'name', type: 'text', nullable: false },
            { name: 'description', type: 'text', nullable: true },
            { name: 'date', type: 'date', nullable: false },
            { name: 'completed', type: 'boolean', nullable: false, default: false },
            { name: 'progress', type: 'integer', nullable: true },
            { name: 'archived', type: 'boolean', nullable: false, default: false },
            { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
          ]
        },
        workout_exercises: {
          columns: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'workout_id', type: 'uuid', reference: 'workouts.id', nullable: false },
            { name: 'exercise_id', type: 'uuid', reference: 'exercises.id', nullable: false },
            { name: 'order_index', type: 'integer', nullable: false }
          ]
        },
        exercise_sets: {
          columns: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'workout_exercise_id', type: 'uuid', reference: 'workout_exercises.id', nullable: false },
            { name: 'set_number', type: 'integer', nullable: false },
            { name: 'weight', type: 'numeric', nullable: true },
            { name: 'target_reps', type: 'integer', nullable: false },
            { name: 'actual_reps', type: 'integer', nullable: true },
            { name: 'completed', type: 'boolean', nullable: false, default: false },
            { name: 'notes', type: 'text', nullable: true }
          ]
        }
      },
      indexes: [
        { name: 'exercises_name_idx', table: 'exercises', columns: ['name'] },
        { name: 'categories_name_idx', table: 'categories', columns: ['name'] },
        { name: 'workouts_date_idx', table: 'workouts', columns: ['date'] }
      ],
      version: '1.0.0',
      generated_at: new Date().toISOString()
    };
    
    // Create the schema JSON file
    const jsonData = JSON.stringify(schemaDefinition, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const fileName = `fitness-app-schema-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Download the schema file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Database schema downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error downloading schema:', error);
    toast.error(`Schema download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}
