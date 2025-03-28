
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, addDays, parseISO, isValid } from 'date-fns';
import FutureExerciseChartHeader from './FutureExerciseChartHeader';

interface WorkoutFrequencyFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
  futureDays?: number;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-green-100 p-3 mb-4">
      <BarChart3 className="h-6 w-6 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming workout schedule</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Plan future workouts in the next 7 days to see your workout frequency schedule
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-32 mt-1" />
    <Skeleton className="h-[200px] w-full rounded-lg mt-4" />
  </div>
);

const WorkoutFrequencyFutureChart: React.FC<WorkoutFrequencyFutureChartProps> = ({ 
  data, 
  isLoading,
  view,
  futureDays = 7
}) => {
  // Always initialize hooks at the top level
  const [hasFutureData, setHasFutureData] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Array<{ name: string; workouts: number; date: Date }>>([]);
  
  // Generate frequency data from the upcoming workouts
  useEffect(() => {
    // Reset state first to avoid stale data
    setFrequencyData([]);
    
    // Check if we have data with future counts - fixed to properly check for actual data
    const hasValidData = data && data.length > 0;
    console.log('WorkoutFrequencyFutureChart checking for valid data:', hasValidData, 'from', data?.length || 0, 'items');
    
    setHasFutureData(hasValidData);
    
    // Only proceed if we have actual data
    if (!hasValidData) {
      setFrequencyData([]);
      return;
    }
    
    // Create data for the specified future days
    const today = new Date();
    
    // Initialize frequencyData with zero workouts for each day
    const nextDays = Array.from({ length: futureDays }, (_, i) => {
      const day = addDays(today, i);
      return {
        name: format(day, 'EEE, MMM d'),
        workouts: 0,
        date: day
      };
    });
    
    // Extract workout dates from the data
    const futureDates = new Map<string, number>();
    
    // Group workouts by date and count them for each date
    data.forEach(item => {
      if (item.futureWorkoutDates && Array.isArray(item.futureWorkoutDates)) {
        item.futureWorkoutDates.forEach(dateStr => {
          try {
            // Parse the date string and check if it's valid
            const date = parseISO(dateStr);
            if (isValid(date)) {
              const dayKey = format(date, 'yyyy-MM-dd');
              futureDates.set(dayKey, (futureDates.get(dayKey) || 0) + 1);
            }
          } catch (error) {
            console.error('Error parsing date:', dateStr, error);
          }
        });
      }
    });
    
    console.log('Future workout dates extracted:', Array.from(futureDates.entries()));
    
    // Update frequency data with actual workout counts
    const updatedFrequencyData = nextDays.map(day => {
      const dayKey = format(day.date, 'yyyy-MM-dd');
      const workoutCount = futureDates.has(dayKey) ? 1 : 0; // Count unique days, not workouts
      return {
        ...day,
        workouts: workoutCount
      };
    });
    
    setFrequencyData(updatedFrequencyData);
  }, [data, view, futureDays]);

  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Always render empty state if no data
  if (!hasFutureData || frequencyData.length === 0) {
    return (
      <Card>
        <FutureExerciseChartHeader
          title="Upcoming Workout Schedule"
          description="See your planned workout frequency"
          tooltipContent="This shows your upcoming workout schedule for the next few days."
          futureDays={futureDays}
        />
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <FutureExerciseChartHeader
        title="Upcoming Workout Schedule"
        description="Your planned workout frequency"
        tooltipContent="This chart shows how many workouts you have scheduled for each day in the upcoming period."
        futureDays={futureDays}
      />
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={frequencyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ 
                  value: 'Number of Workouts', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={(value) => [`${value} ${Number(value) === 1 ? 'workout' : 'workouts'}`, 'Scheduled']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar 
                dataKey="workouts" 
                name="Scheduled Workouts" 
                fill="#8bc34a" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="text-green-800 font-medium mb-1">Average</h4>
            <p className="text-2xl font-bold text-green-700">
              {frequencyData.length > 0 
                ? (frequencyData.reduce((acc, curr) => acc + curr.workouts, 0) / frequencyData.length).toFixed(1) 
                : '0'} 
              <span className="text-base font-normal">workouts/day</span>
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-blue-800 font-medium mb-1">Total Scheduled</h4>
            <p className="text-2xl font-bold text-blue-700">
              {frequencyData.reduce((acc, curr) => acc + curr.workouts, 0)} 
              <span className="text-base font-normal">workouts</span>
            </p>
          </div>
        </div>
        
        <div className="mt-4 px-4 py-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Pro Tip:</span> For optimal progress, aim for 3-5 workouts per week with adequate rest days in between.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyFutureChart;
