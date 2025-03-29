
import { supabase } from '@/integrations/supabase/client';

// Improved function specifically for metrics - gets all completed workouts in date range
export const getWorkoutsForMetrics = async (from: string, to: string): Promise<any[]> => {
  console.log(`Fetching metrics data from ${from} to ${to}`);
  
  // Get today's date to enable finding future workouts
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  // Important: Don't filter future workouts by completion status
  // Always include all workouts for future date ranges
  
  // Detailed logging to help debug
  console.log('Metrics query details:', {
    todayFormatted,
    requestedFrom: from,
    requestedTo: to,
    isPastPeriod: to < todayFormatted,
    hasFutureComponent: to >= todayFormatted
  });
  
  // FOR ALL QUERIES: Include all future workouts regardless of completion status
  // Only filter past workouts by completion
  
  // Execute the query - no completion filter for future dates
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
    .eq('archived', false) // Only filter out archived workouts
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching workouts for metrics:', error);
    return [];
  }
  
  // Log detailed information about found workouts
  console.log(`Found ${data?.length || 0} total workouts within range ${from} to ${to}`);
  
  // Log each workout's details for debugging
  if (data && data.length > 0) {
    data.forEach(workout => {
      console.log(`Workout: ${workout.name}, date: ${workout.date}, completed: ${workout.completed}, exercises: ${workout.workout_exercises?.length || 0}, isFuture: ${workout.date > todayFormatted}`);
    });
  } else {
    console.log('No workouts found in the specified date range');
  }
  
  return data || [];
};
