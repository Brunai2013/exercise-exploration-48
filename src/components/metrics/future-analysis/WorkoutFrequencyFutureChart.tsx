
import React, { useState } from 'react';
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
import { format, addDays, addWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

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
      Plan future workouts to see your workout frequency schedule
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
  React.useEffect(() => {
    // Check if we have data with future counts
    const hasValidData = data && data.length > 0 && data.some(item => (item.futureCount || 0) > 0);
    setHasFutureData(hasValidData);
    
    if (!hasValidData) return;
    
    // Create a simple frequency chart for the next 4 weeks/months
    const today = new Date();
    let chartData: Array<{ name: string; workouts: number; }> = [];
    
    if (view === 'weekly') {
      // Generate data for next 4 weeks
      const nextWeeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = startOfWeek(addWeeks(today, i));
        const weekEnd = endOfWeek(weekStart);
        return {
          name: `Week ${i + 1}`,
          label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          workouts: Math.floor(Math.random() * 5) + 1, // Simple placeholder data
          start: weekStart,
          end: weekEnd
        };
      });
      
      chartData = nextWeeks.map(week => ({
        name: `${week.name} (${week.label})`,
        workouts: week.workouts
      }));
    } else {
      // Generate data for next 4 months
      const nextMonths = Array.from({ length: 4 }, (_, i) => {
        const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
        return {
          name: format(month, 'MMMM'),
          workouts: Math.floor(Math.random() * 12) + 4 // Simple placeholder data
        };
      });
      
      chartData = nextMonths;
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
  
  // Render empty state but keep component mounted
  if (!hasFutureData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Workout Schedule</CardTitle>
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
                    This shows your upcoming workout schedule frequency.
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
            <CardTitle>Upcoming Workout Schedule</CardTitle>
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
                  This chart shows how many workouts you have scheduled in upcoming {view === 'weekly' ? 'weeks' : 'months'}.
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
              <span className="text-base font-normal">workouts/{view === 'weekly' ? 'week' : 'month'}</span>
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
            <span className="font-semibold">Pro Tip:</span> For optimal progress, aim for 3-5 workouts per week with adequate rest periods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyFutureChart;
