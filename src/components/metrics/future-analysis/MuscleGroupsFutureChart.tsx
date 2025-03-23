
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MuscleGroupsFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

// Component for empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming workout data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see your muscle group distribution
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

// Custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">Count: {data.value}</p>
        <p className="text-sm">Percentage: {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

const MuscleGroupsFutureChart: React.FC<MuscleGroupsFutureChartProps> = ({ data, isLoading }) => {
  // Always use the same rendering path to avoid hook order issues
  // Prepare data for pie chart - do this unconditionally to avoid hook ordering issues
  const pieData = React.useMemo(() => {
    return data
      .filter(item => (item.futureCount || 0) > 0)
      .map(item => ({
        id: item.id,
        name: item.category,
        value: item.futureCount || 0,
        percentage: item.futurePercentage || 0,
        color: item.color || '#6366F1'
      }));
  }, [data]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }

  const hasFutureData = pieData.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Muscle Group Distribution</CardTitle>
            <CardDescription>
              See what muscle groups you'll be focusing on in the future
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
                  It helps identify which muscle groups you'll be working on and their relative proportions.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Muscle Group Balance</h3>
              <div className="space-y-3">
                {pieData.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate mr-2">{item.name}</p>
                        <p className="text-sm text-gray-500 whitespace-nowrap">
                          {item.percentage}% ({item.value} exercises)
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Pro Tip:</span> Aim for a balanced distribution of muscle groups in your workout plan to promote overall fitness.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsFutureChart;
