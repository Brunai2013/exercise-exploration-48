import { supabase } from '@/integrations/supabase/client';
import { Workout } from '../types';
import { formatWorkoutsFromDb, formatWorkoutFromDb } from './utils';

// Get recently completed workouts
export const getRecentWorkouts = async (): Promise<Workout[]> => {
  // Return completed workouts, sorted by date (most recent first)
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .eq('completed', true)
    .eq('archived', false) // Filter out archived workouts
    .order('date', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('Error fetching recent workouts:', error);
    return [];
  }
  
  return formatWorkoutsFromDb(data || []);
};

// Get workouts scheduled for today
export const getTodayWorkouts = async (): Promise<Workout[]> => {
  // Get today's date in yyyy-MM-dd format in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  console.log('Today date used for queries:', todayString); // Debug log
  
  // Return workouts scheduled for today
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .eq('date', todayString)
    .eq('archived', false); // Filter out archived workouts
  
  if (error) {
    console.error('Error fetching today workouts:', error);
    return [];
  }
  
  return formatWorkoutsFromDb(data || []);
};

// Get upcoming workouts
export const getUpcomingWorkouts = async (): Promise<Workout[]> => {
  // Get today's date in yyyy-MM-dd format in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  console.log('Today date used for upcoming workouts:', todayString); // Debug log
  
  // Return future workouts, sorted by date (soonest first)
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .gt('date', todayString)
    .eq('archived', false) // Filter out archived workouts
    .order('date', { ascending: true })
    .limit(3);
  
  if (error) {
    console.error('Error fetching upcoming workouts:', error);
    return [];
  }
  
  return formatWorkoutsFromDb(data || []);
};

// Get workouts for a specific date
export const getWorkoutsByDate = async (date: string): Promise<Workout[]> => {
  // Return workouts scheduled for the specified date
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .eq('date', date)
    .eq('archived', false); // Filter out archived workouts
  
  if (error) {
    console.error('Error fetching workouts by date:', error);
    return [];
  }
  
  return formatWorkoutsFromDb(data || []);
};

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

// Improved function specifically for metrics - gets all completed workouts in date range
export const getWorkoutsForMetrics = async (from: string, to: string): Promise<any[]> => {
  console.log(`Fetching metrics data from ${from} to ${to}`);
  
  // Use a more optimized query specifically for metrics
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      id, 
      name, 
      date, 
      completed,
      archived,
      workout_exercises(
        id,
        exercises(id, name, category)
      )
    `)
    .gte('date', from)
    .lte('date', to)
    .eq('completed', true)
    .eq('archived', false) // Explicitly filter out archived workouts
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching workouts for metrics:', error);
    return [];
  }
  
  // Log more detailed information about found workouts
  console.log(`Found ${data?.length || 0} workouts for metrics within range ${from} to ${to}`);
  console.log(`All workouts have archived=false: ${data?.every(w => w.archived === false)}`);
  
  // Log the first workout found (if any) to help with debugging
  if (data && data.length > 0) {
    console.log('Sample workout data:', JSON.stringify(data[0], null, 2));
  }
  
  return data || [];
};
