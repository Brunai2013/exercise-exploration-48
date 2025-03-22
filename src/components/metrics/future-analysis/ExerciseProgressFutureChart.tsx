
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell, ChartBar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

// Component for empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming exercise data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see your exercise distribution
    </p>
  </div>
);

// Component for loading state
const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-32 mt-1" />
    <Skeleton className="h-[200px] w-full rounded-lg mt-4" />
  </div>
);

// Custom tooltip component for the bar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">Count: {data.value}</p>
        <p className="text-sm">Category: {data.category}</p>
      </div>
    );
  }
  return null;
};

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  // Always use the same rendering path to avoid hook order issues
  // Process data for exercises instead of categories
  const exerciseFutureData = React.useMemo(() => {
    // In a real implementation, we would be working with exercise-level data
    // For now, we're using the category data but treating each as an "exercise"
    // This would be replaced with actual exercise data from the hook
    
    return data
      .filter(item => item.futureCount > 0)
      .slice(0, 10)  // Show top 10 exercises
      .map((item, index) => ({
        id: item.id,
        name: item.category, // In real data this would be exercise name
        category: item.category,
        value: item.futureCount,
        color: item.color
      }))
      .sort((a, b) => b.value - a.value); // Sort by count desc
  }, [data]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }

  const hasFutureData = exerciseFutureData.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Exercise Distribution</CardTitle>
            <CardDescription>
              See which exercises you'll be doing the most in your scheduled workouts
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
                  This chart shows the most frequently scheduled individual exercises in your upcoming workouts. 
                  It helps identify which specific exercises you'll be focusing on the most.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        {!hasFutureData ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={exerciseFutureData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {exerciseFutureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Pro Tip:</span> A balanced exercise plan should include a variety of exercises that target different muscle groups and movement patterns.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
