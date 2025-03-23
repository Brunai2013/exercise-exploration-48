
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Dumbbell, CheckCircle2 } from 'lucide-react';
import { Workout } from '@/lib/types';

interface WorkoutProgressCardProps {
  workout: Workout;
  progress: number;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  allSetsCompleted?: boolean;
}

const WorkoutProgressCard: React.FC<WorkoutProgressCardProps> = ({
  workout,
  progress,
  elapsedTime,
  formatTime,
  allSetsCompleted = false
}) => {
  // If all sets are completed, show 100% regardless of calculated progress
  const displayProgress = allSetsCompleted ? 100 : progress;
  
  console.log('WorkoutProgressCard rendering with:', { progress, allSetsCompleted, displayProgress });

  return (
    <Card className="mb-6 border-2 border-primary/10">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-muted-foreground">Workout Time</span>
            <span className="text-2xl font-semibold">{formatTime(elapsedTime)}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
            <Dumbbell className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-muted-foreground">Exercises</span>
            <span className="text-2xl font-semibold">{workout?.exercises.length || 0}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
            <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-muted-foreground">Completion</span>
            <span className="text-2xl font-semibold">{displayProgress}%</span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{displayProgress}%</span>
          </div>
          <Progress value={displayProgress} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutProgressCard;
