
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { renderCustomizedLabel, renderActiveShape, usePieActiveState } from "../muscle-groups/MuscleGroupChartRenderers";

interface MuscleGroupsFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <InfoIcon className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No future workout data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see muscle group distribution analysis
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const MuscleGroupsFutureChart: React.FC<MuscleGroupsFutureChartProps> = ({ 
  data, 
  isLoading 
}) => {
  const { activeIndex, onPieEnter } = usePieActiveState();
  
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Filter to only categories with future data
  const categoriesWithFutureData = data.filter(item => item.futureCount > 0);
  
  if (categoriesWithFutureData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Future Muscle Group Analysis</CardTitle>
              <CardDescription>
                Distribution of muscle groups in your upcoming workouts
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
                    This chart shows how your upcoming workouts focus on different muscle groups.
                    Schedule future workouts to see this analysis.
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

  // Prepare data for the pie chart
  const chartData = categoriesWithFutureData.map(item => ({
    name: item.category,
    value: item.futureCount,
    percentage: item.futurePercentage,
    color: item.color
  }));

  // Generate chart configuration from data
  const chartConfig = chartData.reduce((config, item) => {
    config[item.name] = { color: item.color };
    return config;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Future Muscle Group Analysis</CardTitle>
            <CardDescription>
              Distribution of muscle groups in your upcoming workouts
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
                  This chart shows how your upcoming workouts focus on different muscle groups,
                  helping you ensure balanced training in your future plans.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/5 h-full flex items-center justify-center py-8">
            <div className="w-full h-full" style={{ height: '450px' }}>
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
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
                      {chartData.map((entry, index) => (
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
                            const item = chartData.find(d => d.name === name);
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
          
          <div className="w-full md:w-2/5 border-l border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Muscle Group Distribution</h3>
              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">{item.value} exercises</span>
                      <span className="text-sm font-semibold">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsFutureChart;
