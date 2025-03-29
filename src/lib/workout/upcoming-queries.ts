
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '../types';
import { formatWorkoutsFromDb } from './utils';

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
    .limit(10); // Increased limit to get more future workouts
  
  if (error) {
    console.error('Error fetching upcoming workouts:', error);
    return [];
  }
  
  console.log(`Found ${data?.length || 0} upcoming workouts after ${todayString}`);
  
  return formatWorkoutsFromDb(data || []);
};
