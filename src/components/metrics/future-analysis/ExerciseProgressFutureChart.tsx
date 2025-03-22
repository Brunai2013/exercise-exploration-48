
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon, Search } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <InfoIcon className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No future exercises</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to analyze your upcoming exercise distribution
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ 
  data, 
  isLoading 
}) => {
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
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
              <CardTitle>Future Exercise Analysis</CardTitle>
              <CardDescription>
                Exercise distribution in your upcoming workouts
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
                    This chart shows the distribution of exercise categories in your future workouts.
                    Schedule upcoming workouts to see this analysis.
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

  // Select first category if none selected
  useMemo(() => {
    if (categoriesWithFutureData.length > 0 && !selectedCategory) {
      setSelectedCategory(categoriesWithFutureData[0].id);
    }
  }, [categoriesWithFutureData, selectedCategory]);

  // Prepare data for the chart
  const chartData = categoriesWithFutureData.map(item => ({
    name: item.category,
    value: item.futureCount,
    percentage: item.futurePercentage,
    color: item.color,
    id: item.id
  }));

  // Get the selected category data
  const selectedCategoryData = chartData.find(item => item.id === selectedCategory);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Future Exercise Analysis</CardTitle>
            <CardDescription>
              Exercise distribution in your upcoming workouts
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
                  This analysis shows how your future workouts distribute exercises across categories,
                  helping you plan a balanced training regimen.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-shrink-0">
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="category-select" className="w-[220px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {chartData.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barSize={50}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: "#E5E7EB" }}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ 
                    value: "Number of Exercises", 
                    angle: -90, 
                    position: "insideLeft",
                    offset: -5,
                    style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
                  }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} exercises (${props.payload.percentage}%)`, 'Exercises']}
                  labelFormatter={(value) => `Category: ${value}`}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.id === selectedCategory ? entry.color : `${entry.color}80`}
                      stroke={entry.id === selectedCategory ? "#fff" : "none"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Selected Category Details */}
          {selectedCategoryData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: selectedCategoryData.color }}
                />
                {selectedCategoryData.name} Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Exercises</p>
                  <p className="text-xl font-bold">{selectedCategoryData.value}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Percentage of Total</p>
                  <p className="text-xl font-bold">{selectedCategoryData.percentage}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
