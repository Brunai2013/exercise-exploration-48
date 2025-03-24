
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById } from '@/lib/workouts';
import { Workout } from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Hooks
import { useWorkoutSessionState } from '@/hooks/workout-session/useWorkoutSessionState';

// Components
import WorkoutSessionContent from './WorkoutSessionContent';
import WorkoutErrorState from './WorkoutErrorState';
import WorkoutLoadingState from './WorkoutLoadingState';

const WorkoutSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Setup the workout session state with all our hooks
  const workoutSessionState = useWorkoutSessionState(workout, setWorkout);
  
  const fetchWorkout = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching workout with ID:', id);
      
      const foundWorkout = await getWorkoutById(id);
      
      if (foundWorkout) {
        console.log('Workout found:', foundWorkout.name);
        console.log('Exercise count:', foundWorkout.exercises?.length || 0);
        
        // Ensure each exercise has an initialized sets array
        if (foundWorkout.exercises) {
          foundWorkout.exercises = foundWorkout.exercises.map(exercise => ({
            ...exercise,
            sets: Array.isArray(exercise.sets) ? exercise.sets : []
          }));
        }
        
        console.log('Processed exercises:', 
          foundWorkout.exercises?.map(ex => ({
            name: ex.exercise.name,
            id: ex.id,
            setsCount: ex.sets?.length || 0,
            sets: ex.sets
          }))
        );
        
        setWorkout(foundWorkout);
      } else {
        console.error('No workout found with ID:', id);
        setError('Workout not found');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching workout:', errorMessage);
      setError('Failed to load workout. Please try again.');
      
      toast({
        title: "Error",
        description: "Failed to load workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  if (loading) {
    return <WorkoutLoadingState />;
  }

  if (error || !workout) {
    return <WorkoutErrorState error={error} />;
  }

  return (
    <PageContainer>
      <WorkoutSessionContent
        workout={workout}
        workoutSessionState={workoutSessionState}
      />
    </PageContainer>
  );
};

export default WorkoutSessionPage;
