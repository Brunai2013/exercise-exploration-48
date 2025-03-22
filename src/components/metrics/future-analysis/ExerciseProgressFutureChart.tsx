
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell, Filter, ArrowUpDown } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip, Cell, LabelList 
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/metrics/exercise-progress/ChartStates";

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  console.log("ExerciseProgressFutureChart data:", data, "isLoading:", isLoading);
  
  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'mostScheduled' | 'alphabetical'>('mostScheduled');
  
  // Generate mock exercise data from categories for visualization
  const {
    uniqueCategories,
    exerciseData,
  } = useMemo(() => {
    console.log("Processing category data for exercise visualization");
    
    if (!data || data.length === 0) {
      return {
        uniqueCategories: ['all'],
        exerciseData: [],
      };
    }
    
    const categories = ['all', ...data.map(item => item.category)];
    const exercises: Array<{
      name: string;
      category: string;
      count: number;
      color: string;
    }> = [];
    
    // Generate exercise data from categories
    data.forEach(category => {
      // For visualization purposes, create 2-4 exercises per category based on future count
      const numExercises = Math.max(2, Math.min(Math.floor(category.futureCount / 2) + 1, 4));
      
      for (let i = 0; i < numExercises; i++) {
        const exerciseName = `${category.category} Exercise ${i + 1}`;
        const count = Math.max(1, Math.floor(category.futureCount / numExercises));
        
        exercises.push({
          name: exerciseName,
          category: category.category,
          count: count,
          color: category.color
        });
      }
    });
    
    console.log("Generated exercise data:", exercises.length, "unique categories:", categories.length);
    
    return {
      uniqueCategories: categories,
      exerciseData: exercises,
    };
  }, [data]);
  
  // Filter exercises based on selected category
  const filteredExercises = useMemo(() => {
    let result = exerciseData;
    
    if (selectedCategory !== 'all') {
      result = result.filter(ex => ex.category === selectedCategory);
    }
    
    // Apply sorting
    if (sortBy === 'mostScheduled') {
      result = [...result].sort((a, b) => b.count - a.count);
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // For better visualization, limit to top 10
    return result.slice(0, 10);
  }, [exerciseData, selectedCategory, sortBy]);
  
  // Format data for bar chart
  const chartData = filteredExercises.map(item => ({
    name: item.name,
    value: item.count,
    color: item.color
  }));
  
  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Check if we have any data to display
  const hasData = data.length > 0 && chartData.length > 0;
  console.log("Has data:", hasData, "data length:", data.length, "chart data length:", chartData.length);

  if (!hasData) {
    return (
      <Card>
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
    <Card>
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
                  This chart shows the most frequently scheduled exercises in your upcoming workouts. 
                  You can filter by category to focus on specific muscle groups.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls and filters */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 ml-auto flex gap-1 items-center"
              onClick={() => setSortBy(sortBy === 'mostScheduled' ? 'alphabetical' : 'mostScheduled')}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="text-xs">
                {sortBy === 'mostScheduled' ? 'Most Scheduled' : 'A-Z'}
              </span>
            </Button>
          </div>
          
          {/* Bar chart visualization */}
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  label={{ value: 'Number of Sets', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} sets`, 'Count']}
                  labelFormatter={(label) => `Exercise: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  name="Count"
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(value: number) => `${value}`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Info section */}
          <div className="mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                <span className="font-semibold">Pro Tip:</span> A balanced exercise plan should include a variety of exercises that target different muscle groups and movement patterns.
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
