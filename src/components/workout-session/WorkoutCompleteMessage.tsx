
import React from 'react';
import { Award, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutCompleteMessageProps {
  progress: number;
  isSaving: boolean;
  saveWorkoutProgress: () => Promise<void>;
  allSetsCompleted?: boolean;
}

const WorkoutCompleteMessage: React.FC<WorkoutCompleteMessageProps> = ({
  progress,
  isSaving,
  saveWorkoutProgress,
  allSetsCompleted = false
}) => {
  // Only show the complete message if progress is 100% OR all sets are completed
  const isWorkoutComplete = progress === 100 || allSetsCompleted === true;
  
  if (!isWorkoutComplete) {
    console.log('WorkoutCompleteMessage not showing because:', { progress, allSetsCompleted });
    return null;
  }
  
  console.log('WorkoutCompleteMessage showing because:', { progress, allSetsCompleted });
  
  return (
    <div className="flex flex-col items-center justify-center bg-green-50 p-8 rounded-lg mb-8 animate-fade-in">
      <Award className="h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-green-700 mb-2">Workout Complete!</h2>
      <p className="text-green-600 mb-4 text-center">Congratulations on completing your workout! Save your progress to record this achievement.</p>
      <Button 
        onClick={saveWorkoutProgress} 
        size="lg" 
        className="bg-green-500 hover:bg-green-600" 
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5 mr-2" />
            Save & Complete
          </>
        )}
      </Button>
    </div>
  );
};

export default WorkoutCompleteMessage;
