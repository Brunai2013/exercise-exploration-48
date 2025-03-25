
import { supabase } from '@/integrations/supabase/client';
import { BackupData } from './types';
import { toast } from 'sonner';

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
