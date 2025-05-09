
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import FutureExerciseChartHeader from './FutureExerciseChartHeader';
import FutureTipSection from './FutureTipSection';
import { renderCustomizedLabel, renderActiveShape, usePieActiveState } from '../muscle-groups/MuscleGroupChartRenderers';

interface MuscleGroupsFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
  futureDays?: number;
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

const MuscleGroupsFutureChart: React.FC<MuscleGroupsFutureChartProps> = ({ 
  data, 
  isLoading, 
  futureDays = 7 
}) => {
  console.log('MuscleGroupsFutureChart rendering with data:', data?.length, 'items, isLoading:', isLoading);
  
  const { activeIndex, onPieEnter } = usePieActiveState();

  // Always use the same rendering path to avoid hook order issues
  // Prepare data for pie chart - do this unconditionally to avoid hook ordering issues
  const pieData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // More detailed logging to help debug
    console.log('MuscleGroupsFutureChart processing data:', data.length, 'items');
    
    const processedData = data
      .filter(item => (item.futureCount || 0) > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        value: item.futureCount || 0,
        count: item.futureCount || 0,
        percentage: item.futurePercentage || 0,
        color: item.color || '#6366F1'
      }));
      
    console.log('MuscleGroupsFutureChart processed data into', processedData.length, 'items');
    return processedData;
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
  console.log('MuscleGroupsFutureChart has future data:', hasFutureData);
  
  // Generate chart configuration from data
  const chartConfig = pieData.reduce((config, item) => {
    config[item.name] = { color: item.color };
    return config;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className="overflow-hidden h-full">
      <FutureExerciseChartHeader 
        title="Upcoming Muscle Group Distribution" 
        description="See what muscle groups you'll be focusing on in the future" 
        tooltipContent="This chart shows the distribution of muscle groups in your upcoming scheduled workouts. It helps identify which muscle groups you'll be working on and their relative proportions."
        futureDays={futureDays}
      />
      <CardContent className="p-0">
        {!hasFutureData ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-3/5 h-full flex items-center justify-center py-8">
              <div className="w-full h-full" style={{ minHeight: '450px' }}>
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={450}>
                    <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        onMouseEnter={onPieEnter}
                        paddingAngle={2}
                        label={renderCustomizedLabel}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => (
                          <ChartTooltipContent
                            active={active}
                            payload={payload}
                            labelFormatter={(_, payload) => {
                              const item = payload?.[0]?.payload;
                              return item ? `${item.name}` : "";
                            }}
                            formatter={(value, name) => {
                              const item = pieData.find(d => d.name === name);
                              return [`${value} exercises (${item?.percentage || 0}%)`, "Exercises"];
                            }}
                          />
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
            
            <div className="w-full md:w-2/5 p-6 py-8 flex flex-col">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Most Worked Muscle Groups</h4>
              <div className="grid gap-3">
                {pieData.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <span className="text-base font-medium text-gray-800">{item.name}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {item.value} exercise{item.value !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-8">
                <FutureTipSection />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsFutureChart;
