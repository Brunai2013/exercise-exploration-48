
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '../types';

// Archive a workout
export const archiveWorkout = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('workouts')
      .update({ archived: true })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error archiving workout:', error);
    throw error;
  }
};

// Add a new workout
export const addWorkout = async (workout: Workout): Promise<void> => {
  try {
    // First, insert the workout
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
      } as any) // Use type assertion to bypass TypeScript error
      .select('id')
      .single();

    if (workoutError) throw workoutError;

    // Then, insert all workout exercises
    for (const exerciseItem of workout.exercises) {
      const { data: workoutExerciseData, error: workoutExerciseError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutData.id,
          exercise_id: exerciseItem.exerciseId,
          order_index: exerciseItem.order
        })
        .select('id')
        .single();

      if (workoutExerciseError) throw workoutExerciseError;

      // Finally, insert all sets for this exercise
      const setsToInsert = exerciseItem.sets.map((set) => ({
        workout_exercise_id: workoutExerciseData.id,
        set_number: set.setNumber,
        weight: set.weight || null,
        target_reps: set.targetReps,
        actual_reps: set.actualReps || null,
        completed: set.completed
      }));

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(setsToInsert);

      if (setsError) throw setsError;
    }
  } catch (error) {
    console.error('Error adding workout:', error);
  }
};

// Update an existing workout
export const updateWorkout = async (updatedWorkout: Workout): Promise<void> => {
  try {
    // First, update the workout
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({
        name: updatedWorkout.name,
        description: updatedWorkout.description || null,
        date: updatedWorkout.date,
        completed: updatedWorkout.completed,
        progress: updatedWorkout.progress || 0,
        archived: updatedWorkout.archived || false
      } as any)
      .eq('id', updatedWorkout.id);

    if (workoutError) throw workoutError;

    // Then handle exercises and sets
    // Get existing workout exercises
    const { data: existingWorkoutExercises, error: fetchError } = await supabase
      .from('workout_exercises')
      .select('id, exercise_id')
      .eq('workout_id', updatedWorkout.id);

    if (fetchError) throw fetchError;

    // For each exercise in the updated workout
    for (const exerciseItem of updatedWorkout.exercises) {
      const existingWorkoutExercise = existingWorkoutExercises?.find(
        we => we.exercise_id === exerciseItem.exerciseId
      );

      if (existingWorkoutExercise) {
        // Update existing workout exercise
        const { error: updateExerciseError } = await supabase
          .from('workout_exercises')
          .update({ order_index: exerciseItem.order })
          .eq('id', existingWorkoutExercise.id);

        if (updateExerciseError) throw updateExerciseError;

        // Get existing sets
        const { data: existingSets, error: fetchSetsError } = await supabase
          .from('exercise_sets')
          .select('id, set_number')
          .eq('workout_exercise_id', existingWorkoutExercise.id);

        if (fetchSetsError) throw fetchSetsError;

        // Update or insert sets
        for (const set of exerciseItem.sets) {
          const existingSet = existingSets?.find(s => s.set_number === set.setNumber);

          if (existingSet) {
            // Update existing set - make sure to save all properties including completed state
            const { error: updateSetError } = await supabase
              .from('exercise_sets')
              .update({
                weight: set.weight || null,
                target_reps: set.targetReps,
                actual_reps: set.actualReps || null,
                completed: set.completed // Crucial for tracking progress
              })
              .eq('id', existingSet.id);

            if (updateSetError) throw updateSetError;
          } else {
            // Insert new set
            const { error: insertSetError } = await supabase
              .from('exercise_sets')
              .insert({
                workout_exercise_id: existingWorkoutExercise.id,
                set_number: set.setNumber,
                weight: set.weight || null,
                target_reps: set.targetReps,
                actual_reps: set.actualReps || null,
                completed: set.completed
              });

            if (insertSetError) throw insertSetError;
          }
        }

        // Remove sets that no longer exist
        const setNumbersToKeep = exerciseItem.sets.map(s => s.setNumber);
        const setsToDelete = existingSets?.filter(
          s => !setNumbersToKeep.includes(s.set_number)
        );

        if (setsToDelete && setsToDelete.length > 0) {
          const { error: deleteSetError } = await supabase
            .from('exercise_sets')
            .delete()
            .in('id', setsToDelete.map(s => s.id));

          if (deleteSetError) throw deleteSetError;
        }
      } else {
        // Insert new workout exercise
        const { data: newWorkoutExercise, error: insertExerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: updatedWorkout.id,
            exercise_id: exerciseItem.exerciseId,
            order_index: exerciseItem.order
          })
          .select('id')
          .single();

        if (insertExerciseError) throw insertExerciseError;

        // Insert all sets for this new exercise
        const setsToInsert = exerciseItem.sets.map(set => ({
          workout_exercise_id: newWorkoutExercise.id,
          set_number: set.setNumber,
          weight: set.weight || null,
          target_reps: set.targetReps,
          actual_reps: set.actualReps || null,
          completed: set.completed
        }));

        const { error: insertSetsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert);

        if (insertSetsError) throw insertSetsError;
      }
    }

    // Remove workout exercises that no longer exist
    const exerciseIdsToKeep = updatedWorkout.exercises.map(e => e.exerciseId);
    const workoutExercisesToDelete = existingWorkoutExercises?.filter(
      we => !exerciseIdsToKeep.includes(we.exercise_id)
    );

    if (workoutExercisesToDelete && workoutExercisesToDelete.length > 0) {
      const { error: deleteExerciseError } = await supabase
        .from('workout_exercises')
        .delete()
        .in('id', workoutExercisesToDelete.map(we => we.id));

      if (deleteExerciseError) throw deleteExerciseError;
    }
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error; // Re-throw to allow proper error handling at call site
  }
};

// Delete a workout
export const deleteWorkout = async (id: string): Promise<void> => {
  // Delete workout - cascade will handle related records
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting workout:', error);
  }
};
