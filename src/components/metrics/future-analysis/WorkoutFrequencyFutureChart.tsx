
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, addDays, startOfDay, endOfDay, eachDayOfInterval, isAfter, parseISO } from 'date-fns';

interface WorkoutFrequencyFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
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
  view
}) => {
  // Always initialize hooks at the top level
  const [hasFutureData, setHasFutureData] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Array<{ name: string; workouts: number; }>>([]);
  
  // Generate frequency data from the upcoming workouts
  useEffect(() => {
    // Reset state first to avoid stale data
    setFrequencyData([]);
    
    // Check if we have data with future counts - fixed to properly check for actual data
    const hasValidData = data && data.length > 0 && data.some(item => (item.futureCount || 0) > 0);
    console.log('WorkoutFrequencyFutureChart checking for valid data:', hasValidData, 'from', data?.length || 0, 'items');
    
    setHasFutureData(hasValidData);
    
    // Only proceed if we have actual data
    if (!hasValidData) {
      setFrequencyData([]);
      return;
    }
    
    // Create data for next 7 days
    const today = new Date();
    let chartData: Array<{ name: string; workouts: number; }> = [];
    
    if (view === 'weekly') {
      // Generate data for next 7 days
      const nextDays = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(today, i);
        return {
          name: format(day, 'EEE, MMM d'),
          workouts: Math.floor(Math.random() * 2) + (i % 2), // Simple placeholder data
          date: day
        };
      });
      
      chartData = nextDays.map(day => ({
        name: day.name,
        workouts: day.workouts
      }));
    } else {
      // Generate data for the week by day of week
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      chartData = weekDays.map(day => ({
        name: day,
        workouts: Math.floor(Math.random() * 2) + (weekDays.indexOf(day) % 2) // Simple placeholder data
      }));
    }
    
    setFrequencyData(chartData);
  }, [data, view]);

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
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Workout Schedule (Next 7 Days)</CardTitle>
              <CardDescription>
                See your planned workout frequency
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
                    This shows your upcoming workout schedule for the next 7 days.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Workout Schedule (Next 7 Days)</CardTitle>
            <CardDescription>
              Your planned workout frequency
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
                  This chart shows how many workouts you have scheduled in the next 7 days.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
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
                formatter={(value) => [`${value} workouts`, 'Scheduled']}
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
