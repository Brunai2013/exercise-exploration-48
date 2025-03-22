
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Dumbbell, InfoIcon, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No exercise data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete more workouts to track your exercise progress over time
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

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate list of unique exercises
  const uniqueExercises = useMemo(() => {
    const exercises = Array.from(new Set(data.map(item => item.exercise)));
    return exercises.sort();
  }, [data]);

  // Filter exercises by search query
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return uniqueExercises;
    return uniqueExercises.filter(exercise => 
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueExercises, searchQuery]);

  // Select first exercise if none selected
  useMemo(() => {
    if (uniqueExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(uniqueExercises[0]);
    }
  }, [uniqueExercises, selectedExercise]);

  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Exercise Progress</CardTitle>
              <CardDescription>
                Track your strength improvements over time
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
                    Track your progress on specific exercises over time. 
                    Select an exercise to see how your weights and reps have changed.
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

  // Filter data for selected exercise
  const exerciseData = data.filter(item => item.exercise === selectedExercise);

  // Format data for the chart
  const chartData = exerciseData.map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    weight: item.weight,
    reps: item.reps,
    fullDate: item.date
  }));

  // Format date range for display
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription className="mt-1">
              {timeFilter === 'week' ? 'Last Week' : 
               timeFilter === 'month' ? 'Last Month' : dateRangeText}
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How to Use This Chart</h4>
                <p className="text-sm">
                  Select an exercise from the dropdown to see your progress.
                  The chart shows weights and reps over time so you can track your improvements.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <label htmlFor="exercise-select" className="text-sm font-medium mb-2 block">
              Select Exercise
            </label>
            <Select 
              value={selectedExercise} 
              onValueChange={setSelectedExercise}
            >
              <SelectTrigger id="exercise-select" className="w-full">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                <div className="py-2 px-3 sticky top-0 bg-white z-10 border-b">
                  <Input
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {filteredExercises.map(exercise => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
          
          {exerciseData.length > 0 && (
            <div className="w-full sm:w-2/3 flex items-end">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-700 mb-1">Latest Weight</p>
                  <p className="text-xl font-bold">{exerciseData[exerciseData.length - 1].weight} lbs</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-xs text-teal-700 mb-1">Latest Reps</p>
                  <p className="text-xl font-bold">{exerciseData[exerciseData.length - 1].reps}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {exerciseData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value} lbs`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name, props) => {
                    if (name === 'weight') return [`${value} lbs`, 'Weight'];
                    if (name === 'reps') return [`${value}`, 'Reps'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.date === label);
                    return item ? format(parseISO(item.fullDate), 'MMMM d, yyyy') : label;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  activeDot={{ r: 8 }}
                  name="Weight"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="reps"
                  stroke="#14b8a6"
                  name="Reps"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4 bg-gray-50 rounded-lg">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-base font-medium">No data for this exercise</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a different exercise or complete more workouts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
