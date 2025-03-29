
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '../types';
import { formatWorkoutsFromDb, formatWorkoutFromDb } from './utils';

// Get all workouts
export const getAllWorkouts = async (): Promise<Workout[]> => {
  // Return all workouts, sorted by date (most recent first)
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .eq('archived', false) // Filter out archived workouts
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching all workouts:', error);
    return [];
  }
  
  return formatWorkoutsFromDb(data || []);
};

// Get a specific workout by ID
export const getWorkoutById = async (id: string): Promise<Workout | null> => {
  // Find workout by ID with improved query to ensure we get ALL related data including sets
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url),
        exercise_sets(*)
      )
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching workout by id:', error);
    return null;
  }
  
  if (!data) return null;
  
  console.log("Fetched workout data:", {
    id: data.id, 
    name: data.name,
    exerciseCount: data.workout_exercises?.length || 0,
    exercises: data.workout_exercises?.map(ex => ({
      name: ex.exercises?.name,
      setCount: ex.exercise_sets?.length || 0,
      sets: ex.exercise_sets
    }))
  });
  
  return formatWorkoutFromDb(data);
};
