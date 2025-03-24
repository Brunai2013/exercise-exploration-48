
import React from 'react';
import { Workout } from '@/lib/types';

// Components
import WorkoutHeader from '@/components/workout-session/WorkoutHeader';
import WorkoutProgressCard from '@/components/workout-session/WorkoutProgressCard';
import CircuitActions from '@/components/workout-session/CircuitActions';
import CircuitCreationInfo from '@/components/workout-session/CircuitCreationInfo';
import ExerciseGrid from '@/components/workout-session/ExerciseGrid';
import WorkoutCompleteMessage from '@/components/workout-session/WorkoutCompleteMessage';

interface WorkoutSessionContentProps {
  workout: Workout;
  workoutSessionState: any; // Using any here for brevity, but you could define a proper type
}

const WorkoutSessionContent: React.FC<WorkoutSessionContentProps> = ({
  workout,
  workoutSessionState
}) => {
  const {
    // Group state
    exerciseGroups,
    selectedExercises,
    groupingMode,
    isExerciseInGroup,
    toggleExerciseSelection,
    removeFromGroup,
    startGroupingMode,
    cancelGroupingMode,
    handleCreateCustomGroup,
    
    // Progress state
    progress,
    isSaving,
    elapsedTime,
    formatTime,
    saveWorkoutProgress,
    allSetsCompleted,
    
    // Exercise state
    currentExerciseIndex,
    handleSetCompletion,
    handleWeightChange,
    handleActualRepsChange,
    handleNavigateToExercise,
    
    // Category data
    exerciseCategories,
    
    // Set management
    handleAddSet,
    handleRemoveSet,
    
    // Exercise index mapping
    exerciseIndexMap,
  } = workoutSessionState;

  return (
    <>
      <WorkoutHeader 
        workout={workout} 
        isSaving={isSaving} 
        progress={progress} 
        saveWorkoutProgress={saveWorkoutProgress}
        allSetsCompleted={allSetsCompleted}
      />

      <WorkoutProgressCard 
        workout={workout} 
        progress={progress} 
        elapsedTime={elapsedTime} 
        formatTime={formatTime}
        allSetsCompleted={allSetsCompleted}
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
        onAddSet={handleAddSet}
        onRemoveSet={handleRemoveSet}
      />

      <WorkoutCompleteMessage
        progress={progress}
        isSaving={isSaving}
        saveWorkoutProgress={saveWorkoutProgress}
        allSetsCompleted={allSetsCompleted}
      />
    </>
  );
};

export default WorkoutSessionContent;
