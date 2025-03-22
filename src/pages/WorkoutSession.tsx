
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById } from '@/lib/workouts';
import { Workout } from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Components
import WorkoutHeader from '@/components/workout-session/WorkoutHeader';
import WorkoutProgressCard from '@/components/workout-session/WorkoutProgressCard';
import CircuitActions from '@/components/workout-session/CircuitActions';
import CircuitCreationInfo from '@/components/workout-session/CircuitCreationInfo';
import ExerciseGrid from '@/components/workout-session/ExerciseGrid';
import WorkoutCompleteMessage from '@/components/workout-session/WorkoutCompleteMessage';

// Hooks
import { useExerciseGroups } from '@/hooks/workout-session/useExerciseGroups';
import { useWorkoutProgress } from '@/hooks/workout-session/useWorkoutProgress';
import { useExerciseState } from '@/hooks/workout-session/useExerciseState';
import { useCategoryData } from '@/hooks/workout-session/useCategoryData';

const WorkoutSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    exerciseGroups, 
    selectedExercises, 
    groupingMode,
    isExerciseInGroup,
    toggleExerciseSelection,
    removeFromGroup,
    startGroupingMode,
    cancelGroupingMode,
    handleCreateCustomGroup
  } = useExerciseGroups();
  
  const {
    progress,
    isSaving,
    elapsedTime,
    formatTime,
    saveWorkoutProgress
  } = useWorkoutProgress(workout);
  
  const {
    currentExerciseIndex,
    handleSetCompletion,
    handleWeightChange,
    handleActualRepsChange,
    handleNavigateToExercise,
    createExerciseIndexMap
  } = useExerciseState(workout, setWorkout);
  
  const { exerciseCategories } = useCategoryData(workout);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (id) {
        try {
          setLoading(true);
          const foundWorkout = await getWorkoutById(id);
          if (foundWorkout) {
            // Preserve the workout state as is from the database
            // This ensures that completed sets, weights, and reps are retained
            setWorkout(foundWorkout);
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
          toast({
            title: "Error",
            description: "Failed to load workout. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkout();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-lg">Loading workout session...</p>
        </div>
      </PageContainer>
    );
  }

  if (!workout) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Workout Not Found</h2>
          <p className="mb-6">The workout you're looking for doesn't exist.</p>
        </div>
      </PageContainer>
    );
  }

  const exerciseIndexMap = createExerciseIndexMap();

  return (
    <PageContainer>
      <WorkoutHeader 
        workout={workout} 
        isSaving={isSaving} 
        progress={progress} 
        saveWorkoutProgress={saveWorkoutProgress}
      />

      <WorkoutProgressCard 
        workout={workout} 
        progress={progress} 
        elapsedTime={elapsedTime} 
        formatTime={formatTime}
      />

      <CircuitActions 
        groupingMode={groupingMode}
        selectedExercises={selectedExercises}
        startGroupingMode={startGroupingMode}
        cancelGroupingMode={cancelGroupingMode}
        handleCreateCustomGroup={handleCreateCustomGroup}
      />
      
      <CircuitCreationInfo
        groupingMode={groupingMode}
        selectedExercises={selectedExercises}
      />

      <ExerciseGrid
        workout={workout.exercises}
        exerciseGroups={exerciseGroups}
        isExerciseInGroup={isExerciseInGroup}
        currentExerciseIndex={currentExerciseIndex}
        exerciseIndexMap={exerciseIndexMap}
        exerciseCategories={exerciseCategories}
        onSetCompletion={handleSetCompletion}
        onWeightChange={handleWeightChange}
        onActualRepsChange={handleActualRepsChange}
        onNavigateToExercise={handleNavigateToExercise}
        removeFromGroup={removeFromGroup}
        selectedExercises={selectedExercises}
        groupingMode={groupingMode}
        toggleExerciseSelection={toggleExerciseSelection}
      />

      <WorkoutCompleteMessage
        progress={progress}
        isSaving={isSaving}
        saveWorkoutProgress={saveWorkoutProgress}
      />
    </PageContainer>
  );
};

export default WorkoutSession;
