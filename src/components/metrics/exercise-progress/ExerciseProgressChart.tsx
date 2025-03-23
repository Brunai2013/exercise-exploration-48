
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format, parseISO } from "date-fns";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, Sector
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "./ChartStates";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
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

// Render active shape for hover effects
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

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Format date range for display
  const dateRangeText = useMemo(() => {
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);

  const timeDescription = useMemo(() => {
    return timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText;
  }, [timeFilter, dateRangeText]);

  // Process data for pie chart
  const pieData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Group exercises by name and count occurrences
    const exerciseCounts: Record<string, number> = {};
    const exerciseCategories: Record<string, string> = {};
    
    data.forEach(item => {
      if (!exerciseCounts[item.exercise]) {
        exerciseCounts[item.exercise] = 0;
        exerciseCategories[item.exercise] = item.category;
      }
      exerciseCounts[item.exercise]++;
    });
    
    // Calculate total count
    const totalCount = Object.values(exerciseCounts).reduce((a, b) => a + b, 0);
    
    // Generate color mapping based on exercise name
    const exerciseColors: Record<string, string> = {};
    Object.keys(exerciseCounts).forEach(exercise => {
      const hue = Math.abs(exercise.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
      exerciseColors[exercise] = `hsl(${hue}, 70%, 50%)`;
    });
    
    // Create pie chart data
    return Object.entries(exerciseCounts)
      .map(([exercise, count]) => ({
        id: exercise,
        name: exercise,
        value: count,
        percentage: Math.round((count / totalCount) * 100),
        category: exerciseCategories[exercise],
        color: exerciseColors[exercise]
      }))
      .sort((a, b) => b.value - a.value); // Sort by count, descending
  }, [data]);
  
  // Handler for pie segment hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Check if we have any data to display
  const hasData = pieData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
          <CardDescription>
            {timeDescription}
          </CardDescription>
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
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription>
              {timeDescription}
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
                  This chart shows the distribution of exercises you've performed during this period.
                  It helps identify which exercises you've been focusing on.
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
          
          {/* Exercise Stats */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Exercise Breakdown</h3>
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
                        {item.percentage}% ({item.value} times)
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
            
            {/* Exercise Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              {pieData.map(exercise => (
                <Badge 
                  key={exercise.id}
                  variant="outline"
                  className="cursor-pointer"
                  style={{ 
                    borderColor: exercise.color,
                    color: 'inherit'
                  }}
                >
                  {exercise.name}
                </Badge>
              ))}
            </div>
            
            {/* Pro Tip section */}
            <div className="mt-4 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">Tip:</span> Click on exercise names to compare. 
                The chart shows how frequently you've performed each exercise.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
