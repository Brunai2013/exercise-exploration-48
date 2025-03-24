
import { v4 as uuidv4 } from 'uuid';
import { Workout } from '../types';

// Helper function to format workout data from the database into our app's Workout type
export const formatWorkoutFromDb = (dbWorkout: any): Workout => {
  const exercises = (dbWorkout.workout_exercises || []).map((we: any) => {
    // Format the sets for this exercise - ensure we're properly extracting all set data
    const sets = Array.isArray(we.exercise_sets) ? we.exercise_sets.map((set: any) => ({
      id: set.id,
      exerciseId: we.exercise_id,
      setNumber: set.set_number,
      targetReps: set.target_reps,
      actualReps: set.actual_reps,
      weight: set.weight,
      completed: set.completed,
      notes: set.notes
    })) : [];

    // Create the exercise object
    return {
      id: we.id,
      exerciseId: we.exercise_id,
      exercise: {
        id: we.exercises.id,
        name: we.exercises.name,
        description: we.exercises.description || '',
        category: we.exercises.category,
        imageUrl: we.exercises.image_url || ''
      },
      sets: sets,
      order: we.order_index
    };
  });

  // Create the workout object
  return {
    id: dbWorkout.id,
    name: dbWorkout.name,
    description: dbWorkout.description || '',
    date: dbWorkout.date,
    exercises: exercises,
    completed: dbWorkout.completed,
    progress: dbWorkout.progress,
    archived: dbWorkout.archived
  };
};

// Helper function to format an array of workout data from the database
export const formatWorkoutsFromDb = (dbWorkouts: any[]): Workout[] => {
  return dbWorkouts.map(formatWorkoutFromDb);
};

// Generate a unique ID for a new workout
export const generateWorkoutId = (): string => {
  return uuidv4();
};
