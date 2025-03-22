
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
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  workout,
  isSaving,
  progress,
  saveWorkoutProgress
}) => {
  const navigate = useNavigate();
  
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
          <Button onClick={saveWorkoutProgress} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {progress === 100 ? "Complete Workout" : "Save Progress"}
              </>
            )}
          </Button>
        </div>
      }
    />
  );
};

export default WorkoutHeader;
