
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "./ChartStates";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  // Format date range for display
  const dateRangeText = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return "No date range selected";
    }
    try {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    } catch (error) {
      console.error('Error formatting date range:', error);
      return "Invalid date range";
    }
  }, [dateRange]);

  const timeDescription = useMemo(() => {
    return timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText;
  }, [timeFilter, dateRangeText]);

  // Process data for exercise breakdown
  const exerciseData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No exercise data available to process');
      return [];
    }
    
    console.log('Processing exercise data:', data.length, 'items');
    
    // Group exercises by name and count occurrences
    const exerciseCounts: Record<string, number> = {};
    const exerciseCategories: Record<string, string> = {};
    
    data.forEach(item => {
      if (!exerciseCounts[item.exercise]) {
        exerciseCounts[item.exercise] = 0;
        exerciseCategories[item.exercise] = item.category;
      }
      exerciseCounts[item.exercise]++;
    });
    
    // Calculate total count
    const totalCount = Object.values(exerciseCounts).reduce((a, b) => a + b, 0);
    
    // Generate color mapping based on exercise name
    const exerciseColors: Record<string, string> = {};
    Object.keys(exerciseCounts).forEach(exercise => {
      const hue = Math.abs(exercise.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
      exerciseColors[exercise] = `hsl(${hue}, 70%, 50%)`;
    });
    
    // Create exercise data
    return Object.entries(exerciseCounts)
      .map(([exercise, count]) => ({
        id: exercise,
        name: exercise,
        value: count,
        percentage: Math.round((count / totalCount) * 100),
        category: exerciseCategories[exercise],
        color: exerciseColors[exercise],
        displayText: `${Math.round((count / totalCount) * 100)}% (${count} time${count !== 1 ? 's' : ''})`
      }))
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
          <CardTitle>Exercise Progress</CardTitle>
          <CardDescription>
            {timeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  // Split exercises into two columns
  const firstColumnExercises = exerciseData.slice(0, 15);
  const secondColumnExercises = exerciseData.slice(15, 30);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription>
              {timeDescription}
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
                  This breakdown shows the distribution of exercises you've performed during this period.
                  The percentages indicate how frequently you've done each exercise relative to your total workouts.
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
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
