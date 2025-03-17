
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Workout } from '@/lib/types';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  CheckCircle, 
  Circle, 
  Dumbbell,
  ArrowRight,
  Archive,
  Sparkles,
  Flame,
  Copy
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { archiveWorkout } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useDuplicateWorkout } from '@/hooks/workout/useDuplicateWorkout';

interface WorkoutCardProps {
  workout: Workout;
  onArchive?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onArchive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { duplicateWorkout } = useDuplicateWorkout();
  const dateObj = parseISO(workout.date);
  const formattedDate = format(dateObj, 'EEE, MMM d');
  
  const exerciseCount = workout.exercises.length;
  
  const totalSets = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0
  );

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await archiveWorkout(workout.id);
      toast({
        title: "Workout archived",
        description: `"${workout.name}" has been archived.`,
      });
      
      if (onArchive) {
        onArchive();
      }
    } catch (error) {
      console.error('Error archiving workout:', error);
      toast({
        title: "Error",
        description: "Failed to archive workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    duplicateWorkout(workout);
  };

  if (workout.archived) {
    return null; // Don't render archived workouts
  }

  return (
    <Card 
      className="workout-card border-none overflow-hidden hover:translate-y-[-5px] transition-all duration-300 cool-shadow rounded-xl bg-gradient-to-b from-white to-indigo-50/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-5 pb-3 relative">
        {isHovered && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8 text-indigo-500 opacity-80 hover:opacity-100 hover:bg-white/90 z-10 transition-all"
            onClick={handleDuplicate}
            title="Duplicate Workout"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            {workout.completed ? (
              <div className="flex items-center text-sm text-green-600 font-medium bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                <span>Completed</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-blue-600 font-medium bg-gradient-to-r from-blue-50 to-indigo-100 px-3 py-1 rounded-full border border-blue-200">
                <Circle className="h-3.5 w-3.5 mr-1" />
                <span>Pending</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{workout.name}</h3>
        
        {workout.description && (
          <p className="text-muted-foreground text-sm mt-1 mb-1 line-clamp-2">
            {workout.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="flex items-center mb-4 text-sm text-slate-700 bg-gradient-to-r from-slate-100 to-blue-50 p-2.5 rounded-xl">
          <Dumbbell className="h-4 w-4 mr-2 text-indigo-500" />
          <span>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} 
            {' • '}
            {totalSets} {totalSets === 1 ? 'set' : 'sets'}
          </span>
        </div>

        {workout.progress !== undefined && (
          <div className="mt-2 mb-1">
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span>Progress</span>
              <span className="text-indigo-600">{workout.progress}%</span>
            </div>
            <Progress className="h-2.5 bg-slate-100 rounded-full" value={workout.progress} />
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 flex justify-between items-center">
        <div className="flex gap-2">
          <Link to={`/workout/${workout.id}`}>
            <Button variant="ghost" size="sm" className="text-sm hover:bg-indigo-100/50 text-slate-700">
              View Details
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-muted-foreground hover:bg-indigo-100/50" 
            onClick={handleArchive}
          >
            <Archive className="h-3.5 w-3.5 mr-1" />
            Archive
          </Button>
        </div>
        
        {!workout.completed && (
          <Link to={`/workout-session/${workout.id}`}>
            <Button size="sm" className="text-sm flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg rounded-full">
              Start Workout
              {workout.exercises.length > 3 ? 
                <Flame className="h-3.5 w-3.5 ml-1 text-amber-200" /> : 
                <Sparkles className="h-3.5 w-3.5 ml-1" />
              }
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
