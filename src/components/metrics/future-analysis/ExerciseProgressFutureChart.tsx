
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, Sector
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/metrics/exercise-progress/ChartStates";

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

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

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Generate pie chart data from categories
  const pieData = useMemo(() => {
    console.log("Processing category data for exercise pie chart visualization");
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data
      .filter(item => item.futureCount > 0)
      .map(item => ({
        id: item.id,
        name: item.category,
        value: item.futureCount,
        percentage: item.futurePercentage,
        color: item.color
      }));
  }, [data]);
  
  // Handler for pie segment hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  // Render active shape with highlight effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };
  
  // Early return for loading state
  if (isLoading) {
    return <Card className="h-full"><LoadingState /></Card>;
  }
  
  // Check if we have any data to display
  const hasData = pieData.length > 0;
  console.log("Has data:", hasData, "pie data length:", pieData.length);

  if (!hasData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Upcoming Exercise Distribution</CardTitle>
          <CardDescription>
            See which exercises you'll be doing most in your scheduled workouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Exercise Distribution</CardTitle>
            <CardDescription>
              See which exercises you'll be doing most in your scheduled workouts
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
                  This chart shows the distribution of exercises in your upcoming scheduled workouts. 
                  It helps identify which categories of exercises you'll be focusing on.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart Visualization */}
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
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
          
          {/* Exercise Category Stats */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Exercise Categories</h3>
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
            
            {/* Category Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              {pieData.map(category => (
                <Badge 
                  key={category.id}
                  variant="outline"
                  className="cursor-pointer"
                  style={{ 
                    borderColor: category.color,
                    color: 'inherit'
                  }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            
            {/* Pro Tip section */}
            <div className="mt-4 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Pro Tip:</span> A varied exercise program helps prevent plateaus and keeps workouts interesting.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
