
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell, Filter, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format, parseISO } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

// Component for empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-indigo-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-indigo-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No exercise data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete workouts to track your exercise progress over time
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

// Format date for display
const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateStr;
  }
};

// Main component
const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  // State for chart view and filtering options
  const [view, setView] = useState<'weight' | 'reps' | 'volume'>('weight');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'mostUsed' | 'alphabetical'>('mostUsed');
  
  // Format date range for display
  const dateRangeText = useMemo(() => {
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);

  const timeDescription = useMemo(() => {
    return timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText;
  }, [timeFilter, dateRangeText]);

  // Get unique categories and exercises
  const {
    uniqueCategories,
    exercisesByCategory,
    formattedData,
    exerciseCounts,
    exerciseColors
  } = useMemo(() => {
    // Extract unique categories
    const categories = ['all', ...Array.from(new Set(data.map(item => item.category)))];
    
    // Count exercise occurrences
    const counts: Record<string, number> = {};
    const colorMap: Record<string, string> = {};
    
    data.forEach(item => {
      if (!counts[item.exercise]) {
        counts[item.exercise] = 0;
        
        // Assign colors for exercises
        const hue = Math.abs(item.exercise.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
        colorMap[item.exercise] = `hsl(${hue}, 70%, 50%)`;
      }
      counts[item.exercise]++;
    });
    
    // Group exercises by category
    const exerciseGroups: Record<string, string[]> = {};
    
    categories.forEach(category => {
      if (category === 'all') {
        exerciseGroups[category] = Object.keys(counts);
      } else {
        exerciseGroups[category] = data
          .filter(item => item.category === category)
          .map(item => item.exercise)
          .filter((value, index, self) => self.indexOf(value) === index);
      }
    });
    
    // Prepare data for visualization - most recent value for each exercise
    const groupedByExercise: Record<string, any> = {};
    
    data.forEach(item => {
      if (!groupedByExercise[item.exercise] || parseISO(item.date) > parseISO(groupedByExercise[item.exercise].date)) {
        groupedByExercise[item.exercise] = {
          exercise: item.exercise,
          category: item.category,
          weight: item.weight,
          reps: item.reps,
          volume: item.weight * item.reps,
          date: item.date,
          count: counts[item.exercise] || 1
        };
      }
    });
    
    const formatted = Object.values(groupedByExercise);
    
    return {
      uniqueCategories: categories,
      exercisesByCategory: exerciseGroups,
      formattedData: formatted,
      exerciseCounts: counts,
      exerciseColors: colorMap
    };
  }, [data]);
  
  // Filter and sort exercises for display
  const displayExercises = useMemo(() => {
    let exercises = selectedCategory === 'all' 
      ? Object.keys(exerciseCounts)
      : exercisesByCategory[selectedCategory] || [];
    
    // Apply sorting
    if (sortBy === 'mostUsed') {
      exercises = exercises.sort((a, b) => (exerciseCounts[b] || 0) - (exerciseCounts[a] || 0));
    } else {
      exercises = exercises.sort((a, b) => a.localeCompare(b));
    }
    
    return exercises;
  }, [selectedCategory, sortBy, exercisesByCategory, exerciseCounts]);
  
  // Get filtered chart data
  const filteredChartData = useMemo(() => {
    const exercisesToShow = selectedExercises.length > 0 ? selectedExercises : displayExercises.slice(0, 12);
    
    return formattedData
      .filter(item => exercisesToShow.includes(item.exercise))
      .sort((a, b) => {
        if (view === 'weight') return b.weight - a.weight;
        if (view === 'reps') return b.reps - a.reps;
        return b.volume - a.volume;
      });
  }, [formattedData, displayExercises, selectedExercises, view]);
  
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

  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  const viewUnitLabel = view === 'weight' ? 'lbs' : view === 'reps' ? 'reps' : 'lbs × reps';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription className="mt-1">{timeDescription}</CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">About This Chart</h4>
                <p className="text-sm">
                  This chart shows your exercise progress based on the most recent workout data. 
                  You can filter by category and view weight, reps, or total volume (weight × reps).
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        {!data.length ? (
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
              
              <Tabs value={view} onValueChange={(value) => setView(value as any)} className="w-auto">
                <TabsList className="h-9">
                  <TabsTrigger value="weight" className="text-xs">Weight</TabsTrigger>
                  <TabsTrigger value="reps" className="text-xs">Reps</TabsTrigger>
                  <TabsTrigger value="volume" className="text-xs">Volume</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 ml-auto flex gap-1 items-center"
                onClick={() => setSortBy(sortBy === 'mostUsed' ? 'alphabetical' : 'mostUsed')}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {sortBy === 'mostUsed' ? 'Most Used' : 'A-Z'}
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
                  data={filteredChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    label={{ 
                      value: view === 'weight' ? 'Weight (lbs)' : 
                             view === 'reps' ? 'Repetitions' : 
                             'Volume (lbs × reps)',
                      position: 'bottom'
                    }} 
                  />
                  <YAxis 
                    dataKey="exercise" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} ${viewUnitLabel}`, '']}
                    labelFormatter={(label) => `Exercise: ${label}`}
                  />
                  <Bar 
                    dataKey={view} 
                    name={view.charAt(0).toUpperCase() + view.slice(1)}
                    radius={[0, 4, 4, 0]}
                  >
                    {filteredChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={exerciseColors[entry.exercise] || '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Info section */}
            <div className="mt-6 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-800 flex items-center">
                <InfoIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  <span className="font-semibold">Tip:</span> Click on exercise names to compare specific exercises. 
                  The chart shows the most recent values for each selected exercise.
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
