
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
    console.log('WorkoutFrequencyFutureChart - Processing data...', 
      data?.length ? `${data.length} items` : 'no data', 
      'first item has dates:', data?.[0]?.futureWorkoutDates?.length || 0);
    
    // Reset state first to avoid stale data
    setFrequencyData([]);
    
    // Check if we have data with future workout dates
    const hasValidData = data && data.length > 0;
    const hasDataWithDates = hasValidData && data.some(item => 
      item.futureWorkoutDates && item.futureWorkoutDates.length > 0
    );
    
    console.log('WorkoutFrequencyFutureChart - Has valid data:', hasValidData, 
      'has dates:', hasDataWithDates, 
      'from', data?.length || 0, 'items');
    
    setHasFutureData(hasDataWithDates);
    
    // Only proceed if we have actual data with dates
    if (!hasDataWithDates) {
      console.log('No valid data with dates found, not generating frequency data');
      setFrequencyData([]);
      return;
    }
    
    // Get all unique workout dates from all items (they might have different dates)
    const allWorkoutDates = new Set<string>();
    data.forEach(item => {
      if (item.futureWorkoutDates && item.futureWorkoutDates.length > 0) {
        item.futureWorkoutDates.forEach(date => {
          // Check that the date is not circular reference (an issue observed in logs)
          if (typeof date === 'string') {
            allWorkoutDates.add(date);
          }
        });
      }
    });
    
    const workoutDatesArray = Array.from(allWorkoutDates);
    console.log('WorkoutFrequencyFutureChart - All unique workout dates:', workoutDatesArray);
    
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
    
    console.log('WorkoutFrequencyFutureChart - Initialized days:', nextDays.map(d => d.name));
    
    // Update frequency data with actual workout counts
    const updatedFrequencyData = nextDays.map(day => {
      const dayKey = format(day.date, 'yyyy-MM-dd');
      // Check if this day has a workout in our dates array
      const hasWorkout = workoutDatesArray.includes(dayKey);
      
      console.log('Checking day:', dayKey, 'has workout:', hasWorkout);
      
      return {
        ...day,
        workouts: hasWorkout ? 1 : 0
      };
    });
    
    console.log('WorkoutFrequencyFutureChart - Final data:', updatedFrequencyData);
    setFrequencyData(updatedFrequencyData);
  }, [data, view, futureDays]);

  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  console.log('WorkoutFrequencyFutureChart rendering with hasFutureData:', hasFutureData, 'frequencyData length:', frequencyData.length);
  
  // Check for valid data to display
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
                domain={[0, 1]}
                ticks={[0, 1]}
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
