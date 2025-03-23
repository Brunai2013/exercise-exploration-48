
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
  // Find workout by ID
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercises(id, name, description, category, image_url)
      )
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching workout by id:', error);
    return null;
  }
  
  if (!data) return null;
  
  return formatWorkoutFromDb(data);
};
