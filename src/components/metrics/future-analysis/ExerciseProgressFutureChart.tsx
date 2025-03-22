import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <LineChart className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming exercise data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see your planned exercise distribution
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

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  const [hasFutureData, setHasFutureData] = useState(false);
  
  React.useEffect(() => {
    const hasValidData = data && data.length > 0 && data.some(item => item.futureCount > 0);
    setHasFutureData(hasValidData);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  if (!hasFutureData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Exercise Distribution</CardTitle>
              <CardDescription>
                See what exercises you've planned for the future
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
                    This chart shows the distribution of muscle groups in your upcoming scheduled workouts.
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

  const futureData = data
    .filter(item => item.futureCount > 0)
    .map(item => ({
      name: item.category,
      exercises: item.futureCount,
      fill: item.color
    }))
    .sort((a, b) => b.exercises - a.exercises);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Exercise Distribution</CardTitle>
            <CardDescription>
              See what exercises you've planned for the future
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
                  This shows the distribution of exercises by muscle group in your upcoming workouts.
                  It helps you see what areas you're planning to focus on.
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
              data={futureData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Exercises', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                formatter={(value) => [`${value} exercises`, 'Scheduled']}
                labelFormatter={(label) => `Muscle Group: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="exercises" 
                name="Scheduled Exercises" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              >
                {futureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 px-4 py-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">Pro Tip:</span> Compare this with your past workout data to ensure you're maintaining a balanced training approach.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
