
import { useState, useEffect } from 'react';
import { Workout } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { updateWorkout } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';

export const useWorkoutProgress = (workout: Workout | null) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Calculate progress percentage
  useEffect(() => {
    if (workout) {
      const totalSets = workout.exercises.reduce(
        (total, exercise) => total + exercise.sets.length, 
        0
      );
      
      const completedSets = workout.exercises.reduce(
        (total, exercise) => 
          total + exercise.sets.filter(set => set.completed).length, 
        0
      );
      
      const calculatedProgress = totalSets > 0 
        ? Math.round((completedSets / totalSets) * 100) 
        : 0;
      
      setProgress(calculatedProgress);
    }
  }, [workout]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWorkoutProgress = async () => {
    if (!workout) return;
    
    try {
      setIsSaving(true);
      
      // Create a deep copy of the workout with all its current state
      const updatedWorkout = {
        ...workout,
        progress, // Update the progress percentage
        completed: progress === 100 // Mark as complete if 100% done
      };
      
      // Save the workout with all completed sets and input values
      await updateWorkout(updatedWorkout);
      
      toast({
        title: progress === 100 ? "Workout Complete! 💪" : "Progress Saved!",
        description: progress === 100 
          ? "Congratulations on completing your workout!" 
          : "Your workout progress has been saved.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving workout progress:', error);
      toast({
        title: "Error",
        description: "Failed to save workout progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    progress,
    isSaving,
    elapsedTime,
    formatTime,
    saveWorkoutProgress
  };
};
