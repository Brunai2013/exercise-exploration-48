
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format, parseISO } from "date-fns";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Brush 
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

// Component for the empty state
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

// Component for the loading state
const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-32 mt-1" />
    <Skeleton className="h-[300px] w-full rounded-lg mt-4" />
  </div>
);

// Format date for display
const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMM d');
};

// Main component
const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  // State for filtering and view options - maintain consistent hooks
  const [chartType, setChartType] = useState<'weight' | 'reps' | 'volume'>('weight');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);
  
  // Format date range for display
  const dateRangeText = useMemo(() => {
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);

  const timeDescription = useMemo(() => {
    return timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText;
  }, [timeFilter, dateRangeText]);
  
  // Extract unique categories and exercises
  const { 
    uniqueCategories,
    uniqueExercises,
    exercisesByCategory,
    formattedData,
    topExercises,
  } = useMemo(() => {
    // Get unique categories
    const categories = ['all', ...Array.from(new Set(data.map(item => item.category)))];
    
    // Get unique exercises
    const exercises = Array.from(new Set(data.map(item => item.exercise)));
    
    // Group exercises by category
    const exerciseGroups: Record<string, string[]> = { all: exercises };
    data.forEach(item => {
      if (!exerciseGroups[item.category]) {
        exerciseGroups[item.category] = [];
      }
      if (!exerciseGroups[item.category].includes(item.exercise)) {
        exerciseGroups[item.category].push(item.exercise);
      }
    });
    
    // Format data for the chart - group by date and exercise
    const grouped: Record<string, Record<string, { weight: number; reps: number; volume: number }>> = {};
    
    data.forEach(item => {
      const dateKey = formatDate(item.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      
      // Use the latest values for each exercise on the same date
      const volume = item.weight * item.reps;
      grouped[dateKey][item.exercise] = { 
        weight: item.weight,
        reps: item.reps,
        volume
      };
    });
    
    // Convert to array format for Recharts
    const formatted = Object.entries(grouped).map(([date, exercises]) => {
      const entry: any = { date };
      Object.entries(exercises).forEach(([exercise, values]) => {
        entry[`${exercise}_weight`] = values.weight;
        entry[`${exercise}_reps`] = values.reps;
        entry[`${exercise}_volume`] = values.volume;
      });
      return entry;
    });
    
    // Sort by date
    formatted.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Find top 5 exercises by frequency
    const exerciseCounts: Record<string, number> = {};
    data.forEach(item => {
      exerciseCounts[item.exercise] = (exerciseCounts[item.exercise] || 0) + 1;
    });
    
    const top = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([exercise]) => exercise);
    
    return {
      uniqueCategories: categories,
      uniqueExercises: exercises,
      exercisesByCategory: exerciseGroups,
      formattedData: formatted,
      topExercises: top,
    };
  }, [data]);
  
  // Assign colors to exercises
  const exerciseColors = useMemo(() => {
    const colors = [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
      '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c44dff',
      '#4d79ff', '#ff4d4d', '#4dff88', '#ff4dd3', '#4dfff4'
    ];
    
    const colorMap: Record<string, string> = {};
    uniqueExercises.forEach((exercise, index) => {
      colorMap[exercise] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [uniqueExercises]);
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedExercises([]);
    setShowAll(true);
  };
  
  // Handle exercise selection
  const handleExerciseToggle = (exercise: string) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
    setShowAll(false);
  };
  
  // Get exercises to display based on filters
  const displayedExercises = useMemo(() => {
    if (showAll) {
      return selectedCategory === 'all' 
        ? topExercises 
        : exercisesByCategory[selectedCategory]?.slice(0, 5) || [];
    }
    return selectedExercises;
  }, [selectedCategory, selectedExercises, showAll, topExercises, exercisesByCategory]);
  
  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
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
                  Track your progress for each exercise over time. You can:
                  <br /><br />
                  • Filter by muscle group/category<br />
                  • Select specific exercises to compare<br />
                  • View weight, reps, or volume (weight × reps)<br />
                  • Use the brush at the bottom to zoom in
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
            {/* Filters */}
            <div className="flex flex-wrap gap-3 pb-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filter:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="reps">Reps</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
              
              {showAll ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAll(false)}
                >
                  Showing Top 5
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  Show Top 5
                </Button>
              )}
            </div>
            
            {/* Exercise selection chips */}
            <div className="flex flex-wrap gap-2 pb-3">
              {(selectedCategory === 'all' 
                ? uniqueExercises 
                : exercisesByCategory[selectedCategory] || []
              ).slice(0, 15).map((exercise) => (
                <div
                  key={exercise}
                  onClick={() => handleExerciseToggle(exercise)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium cursor-pointer
                    ${selectedExercises.includes(exercise) || (showAll && topExercises.includes(exercise))
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                  `}
                  style={{
                    borderLeft: `3px solid ${exerciseColors[exercise]}`
                  }}
                >
                  {exercise}
                </div>
              ))}
              {(selectedCategory !== 'all' && exercisesByCategory[selectedCategory]?.length > 15) && (
                <div className="px-3 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
                  +{exercisesByCategory[selectedCategory].length - 15} more
                </div>
              )}
            </div>
            
            {/* Chart */}
            <div className="h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    label={{ 
                      value: chartType === 'weight' ? 'Weight (lbs)' : 
                             chartType === 'reps' ? 'Repetitions' : 'Volume (lbs × reps)',
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12 }
                    }}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      const exerciseName = name.split('_')[0];
                      return [`${value} ${chartType === 'weight' ? 'lbs' : 
                                         chartType === 'reps' ? 'reps' : ''}`, exerciseName];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      const exerciseName = value.split('_')[0];
                      return exerciseName;
                    }}
                  />
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#8884d8"
                    startIndex={Math.max(0, formattedData.length - 10)}
                  />
                  
                  {/* Render selected exercise lines */}
                  {displayedExercises.map((exercise) => (
                    <Line
                      key={exercise}
                      type="monotone"
                      dataKey={`${exercise}_${chartType}`}
                      name={`${exercise}_${chartType}`}
                      stroke={exerciseColors[exercise]}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      connectNulls
                      dot={{ strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tips */}
            <div className="mt-4 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">Pro Tip:</span> Select specific exercises to compare or use the filter to focus on a particular muscle group. Use the brush below the chart to zoom in on specific time periods.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
