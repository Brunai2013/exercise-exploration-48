
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/metrics/exercise-progress/ChartStates";

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ 
  data, 
  isLoading
}) => {
  // Process data for exercise breakdown
  const exerciseData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No future exercise data available to process');
      return [];
    }
    
    console.log('Processing future exercise data:', data.length, 'items');
    
    // Create exercise data from category analysis data
    return data
      .map(item => ({
        id: item.id,
        name: item.name,
        value: item.futureCount || 0,
        percentage: item.futurePercentage || 0,
        category: item.category,
        color: item.color || '#6366F1',
        displayText: `${item.futurePercentage || 0}% (${item.futureCount || 0} time${item.futureCount !== 1 ? 's' : ''})`
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by count, descending
  }, [data]);
  
  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Check if we have any data to display
  const hasData = exerciseData && exerciseData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exercise Distribution</CardTitle>
          <CardDescription>
            See which exercises you'll be doing most in your scheduled workouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  // Split exercises into two columns
  const firstColumnExercises = exerciseData.slice(0, Math.ceil(exerciseData.length / 2));
  const secondColumnExercises = exerciseData.slice(Math.ceil(exerciseData.length / 2));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Exercise Distribution</CardTitle>
            <CardDescription>
              See which exercises you'll be doing most in your scheduled workouts
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">About This Chart</h4>
                <p className="text-sm">
                  This breakdown shows the distribution of exercises in your upcoming scheduled workouts.
                  The percentages indicate how frequently you'll be doing each exercise.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium text-gray-700 text-lg mb-4">Exercise Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Column */}
          <div className="space-y-3">
            {firstColumnExercises.length > 0 ? (
              firstColumnExercises.map((exercise) => (
                <div key={exercise.id} className="space-y-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: exercise.color }}
                    />
                    <span className="text-sm font-medium">{exercise.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${exercise.percentage}%`,
                          backgroundColor: exercise.color 
                        }}
                      />
                    </div>
                    <span className="ml-3 whitespace-nowrap">{exercise.displayText}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No exercise data available</div>
            )}
          </div>
          
          {/* Second Column */}
          <div className="space-y-3">
            {secondColumnExercises.length > 0 ? (
              secondColumnExercises.map((exercise) => (
                <div key={exercise.id} className="space-y-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: exercise.color }}
                    />
                    <span className="text-sm font-medium">{exercise.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${exercise.percentage}%`,
                          backgroundColor: exercise.color 
                        }}
                      />
                    </div>
                    <span className="ml-3 whitespace-nowrap">{exercise.displayText}</span>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
        
        {/* Exercise Badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          {exerciseData.map(exercise => (
            <Badge 
              key={exercise.id}
              variant="outline"
              className="cursor-pointer"
              style={{ 
                borderColor: exercise.color,
                color: 'inherit'
              }}
            >
              {exercise.name}
            </Badge>
          ))}
        </div>
        
        {/* Pro Tip section */}
        <div className="mt-4 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Pro Tip:</span> A varied exercise program helps prevent plateaus and keeps workouts interesting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
