
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MuscleGroupsFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <PieChart className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming workout data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see your planned muscle group focus
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MuscleGroupsFutureChart: React.FC<MuscleGroupsFutureChartProps> = ({ data, isLoading }) => {
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
              <CardTitle>Upcoming Muscle Group Focus</CardTitle>
              <CardDescription>
                See what muscle groups you've planned to work on
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
      value: item.futureCount,
      color: item.color
    }));

  const totalFutureExercises = futureData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Muscle Group Focus</CardTitle>
            <CardDescription>
              See what muscle groups you've planned to work on
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
                  This pie chart shows the distribution of muscle groups in your upcoming workouts,
                  helping you see if your planned training is balanced.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={futureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {futureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} exercises (${((Number(value) / totalFutureExercises) * 100).toFixed(0)}%)`, 
                    name
                  ]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 p-4">
            <h3 className="text-lg font-medium mb-3">Top Focus Areas</h3>
            <div className="space-y-3">
              {futureData
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold">
                        {item.value} exercises ({((Number(item.value) / totalFutureExercises) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
            
            <div className="mt-4 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Pro Tip:</span> Plan your workouts to target all major muscle groups evenly for balanced development.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsFutureChart;
