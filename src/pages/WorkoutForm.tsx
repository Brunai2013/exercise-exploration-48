
import React from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import WorkoutFormLoading from '@/components/workout/WorkoutFormLoading';
import WorkoutFormContent from '@/components/workout/WorkoutFormContent';
import { useWorkoutForm } from '@/hooks/workout/useWorkoutForm';
import { toast } from '@/components/ui/use-toast';
import FormActions from '@/components/exercises/form-components/FormActions';

const WorkoutForm = () => {
  const {
    id,
    workout,
    selectedDate,
    availableExercises,
    searchTerm,
    isLoading,
    isSaving,
    categoryMap,
    categories,
    setSelectedDate,
    setSearchTerm,
    handleInputChange,
    handleReorderExercises,
    handleMoveExercise,
    handleAddExercise,
    handleRemoveExercise,
    handleSetChange,
    handleAddSet,
    handleRemoveSet,
    saveWorkout,
    navigate
  } = useWorkoutForm();
  
  // If the workout is archived, show a message
  if (workout.archived) {
    return (
      <PageContainer>
        <PageHeader 
          title="Archived Workout" 
          description="This workout has been archived"
          action={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="p-8 bg-muted/30 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-4">This workout has been archived</h2>
          <p className="text-muted-foreground mb-6">
            Archived workouts are hidden from the calendar and dashboard.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  const handleSaveWorkout = () => {
    // Validate date is selected before saving
    if (!workout.date) {
      toast({
        title: "Date Required",
        description: "Please select a date for this workout",
        variant: "destructive",
      });
      return;
    }
    
    saveWorkout();
  };
  
  return (
    <PageContainer>
      <PageHeader 
        title={id === 'new' ? "Create Workout" : "Edit Workout"} 
        description="Plan your workout routine"
        action={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSaveWorkout} 
              disabled={isSaving || isLoading}
              className="px-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Workout
                </>
              )}
            </Button>
          </div>
        }
      />
      
      {isLoading ? (
        <WorkoutFormLoading />
      ) : (
        <>
          <WorkoutFormContent
            workout={workout}
            selectedDate={selectedDate}
            availableExercises={availableExercises}
            searchTerm={searchTerm}
            categoryMap={categoryMap}
            categories={categories}
            isLoading={isLoading}
            onNameChange={handleInputChange}
            onDescriptionChange={handleInputChange}
            onDateChange={setSelectedDate}
            onSearchChange={setSearchTerm}
            onExerciseAdd={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onSetChange={handleSetChange}
            onReorderExercises={handleReorderExercises}
            onMoveExercise={handleMoveExercise}
          />
          
          <div className="mt-8">
            <FormActions
              onCancel={() => navigate(-1)}
              isSubmitting={isSaving}
              submitLabel="Save Workout"
              error={undefined}
              onSubmit={handleSaveWorkout}
            />
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default WorkoutForm;
