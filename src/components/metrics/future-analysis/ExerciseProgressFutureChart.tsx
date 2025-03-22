
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell, Filter, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip, Cell 
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

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

// Component for empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
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
    <Skeleton className="h-[300px] w-full rounded-lg mt-4" />
  </div>
);

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  console.log("ExerciseProgressFutureChart data:", data, "isLoading:", isLoading);
  
  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'mostScheduled' | 'alphabetical'>('mostScheduled');
  
  // Process data from categories to exercise-level data
  // In a real implementation, we would have exercise-level data directly
  // For this prototype, we're simulating it from category data
  const {
    uniqueCategories,
    exercisesByCategory,
    exerciseData,
    exerciseColors
  } = useMemo(() => {
    console.log("Processing category data for exercise visualization");
    const categories = ['all', ...data.map(item => item.category)];
    
    // Generate simulated exercise data from categories
    // In a real implementation, this would be actual exercise data
    const exerciseGroups: Record<string, string[]> = { all: [] };
    const exercises: Record<string, {
      name: string;
      category: string;
      count: number;
      color: string;
    }> = {};
    
    data.forEach(category => {
      if (!exerciseGroups[category.category]) {
        exerciseGroups[category.category] = [];
      }
      
      // Generate 3-5 exercises per category
      const numExercises = Math.min(Math.floor(category.futureCount / 2) + 1, 5);
      
      for (let i = 0; i < numExercises; i++) {
        const exerciseName = `${category.category} Exercise ${i + 1}`;
        const count = Math.max(1, Math.floor(category.futureCount / numExercises));
        
        const hue = Math.abs(exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
        const color = category.color || `hsl(${hue}, 70%, 50%)`;
        
        exercises[exerciseName] = {
          name: exerciseName,
          category: category.category,
          count: count,
          color: color
        };
        
        exerciseGroups[category.category].push(exerciseName);
        exerciseGroups.all.push(exerciseName);
      }
    });
    
    // Deduplicate the all category
    exerciseGroups.all = [...new Set(exerciseGroups.all)];
    
    const exerciseArray = Object.values(exercises);
    
    const colorMap: Record<string, string> = {};
    exerciseArray.forEach(ex => {
      colorMap[ex.name] = ex.color;
    });
    
    console.log("Generated exercise data:", exerciseArray.length, "unique categories:", categories.length);
    
    return {
      uniqueCategories: categories,
      exercisesByCategory: exerciseGroups,
      exerciseData: exerciseArray,
      exerciseColors: colorMap
    };
  }, [data]);
  
  // Filter and sort exercises for display
  const displayExercises = useMemo(() => {
    let exercises = selectedCategory === 'all' 
      ? exercisesByCategory.all
      : exercisesByCategory[selectedCategory] || [];
    
    // Apply sorting
    if (sortBy === 'mostScheduled') {
      exercises = [...exercises].sort((a, b) => {
        const aExercise = exerciseData.find(e => e.name === a);
        const bExercise = exerciseData.find(e => e.name === b);
        return (bExercise?.count || 0) - (aExercise?.count || 0);
      });
    } else {
      exercises = [...exercises].sort((a, b) => a.localeCompare(b));
    }
    
    return exercises;
  }, [selectedCategory, sortBy, exercisesByCategory, exerciseData]);
  
  // Get filtered chart data
  const filteredChartData = useMemo(() => {
    const exercisesToShow = selectedExercises.length > 0 
      ? selectedExercises
      : displayExercises.slice(0, 12);
    
    return exerciseData
      .filter(item => exercisesToShow.includes(item.name))
      .sort((a, b) => b.count - a.count);
  }, [exerciseData, displayExercises, selectedExercises]);
  
  // Toggle exercise selection
  const toggleExercise = (exercise: string) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };
  
  // Clear all selected exercises
  const clearSelection = () => {
    setSelectedExercises([]);
  };
  
  // Format data for bar chart
  const chartData = filteredChartData.map(item => ({
    name: item.name,
    value: item.count,
    category: item.category,
    color: item.color
  }));
  
  console.log("Filtered chart data length:", filteredChartData.length, "Chart data:", chartData.length);
  
  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  const hasData = data.length > 0 && chartData.length > 0;
  console.log("Has data:", hasData, "data length:", data.length, "chart data length:", chartData.length);

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
        {!hasData ? (
          <EmptyState />
        ) : (
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
            
            {/* Exercise selection */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedExercises.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSelection}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
              
              {displayExercises.slice(0, 24).map(exercise => (
                <Badge
                  key={exercise}
                  variant={selectedExercises.includes(exercise) ? "default" : "outline"}
                  className="cursor-pointer h-7 select-none"
                  style={{
                    borderLeftColor: exerciseColors[exercise],
                    borderLeftWidth: '3px'
                  }}
                  onClick={() => toggleExercise(exercise)}
                >
                  {exercise}
                </Badge>
              ))}
              
              {displayExercises.length > 24 && (
                <Badge variant="outline" className="bg-muted/40">
                  +{displayExercises.length - 24} more
                </Badge>
              )}
            </div>
            
            {/* Bar chart visualization */}
            <div className="h-[350px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" label={{ value: 'Count', position: 'bottom' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`Count: ${value}`, '']}
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
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
