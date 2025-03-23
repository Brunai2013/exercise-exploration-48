
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Workout } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface WorkoutHeaderProps {
  workout: Workout;
  isSaving: boolean;
  progress: number;
  saveWorkoutProgress: () => Promise<void>;
  allSetsCompleted?: boolean;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  workout,
  isSaving,
  progress,
  saveWorkoutProgress,
  allSetsCompleted = false
}) => {
  const navigate = useNavigate();
  
  // If all sets are completed, treat as 100% progress
  const isComplete = progress === 100 || allSetsCompleted;
  
  console.log('WorkoutHeader rendering with:', { progress, allSetsCompleted, isComplete });
  
  return (
    <PageHeader
      title={`${workout?.name}`}
      description={`Get ready to crush it! ${workout?.description || ''}`}
      action={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <Button 
            onClick={saveWorkoutProgress} 
            disabled={isSaving}
            variant={isComplete ? "default" : "outline"}
            className={isComplete ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isComplete ? "Complete Workout" : "Save Progress"}
              </>
            )}
          </Button>
        </div>
      }
    />
  );
};

export default WorkoutHeader;
