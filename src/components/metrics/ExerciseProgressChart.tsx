
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LineChartIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO, format } from "date-fns";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <LineChartIcon className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No exercise progress data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete workouts to track your progress with specific exercises
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-10 w-64 mb-4" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, isLoading }) => {
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ 
    trend: 'neutral' as 'up' | 'down' | 'neutral', 
    change: 0,
    maxWeight: 0
  });

  useEffect(() => {
    if (data.length) {
      // Extract unique exercise names
      const names = Array.from(new Set(data.map(item => item.exercise)));
      setExerciseNames(names);
      
      // Select the first exercise by default
      if (names.length && !selectedExercise) {
        setSelectedExercise(names[0]);
      }
    }
  }, [data, selectedExercise]);

  useEffect(() => {
    if (selectedExercise && data.length) {
      // Filter data for the selected exercise
      const exerciseData = data.filter(item => item.exercise === selectedExercise);
      
      // Process data for the chart
      const processedData = exerciseData.reduce((acc: any[], curr) => {
        // Find if we already have an entry for this date
        const existingEntryIndex = acc.findIndex(item => item.date === curr.date);
        
        if (existingEntryIndex !== -1) {
          // If the current weight is higher than what we have, update it
          if (curr.weight > acc[existingEntryIndex].weight) {
            acc[existingEntryIndex].weight = curr.weight;
          }
          // Also track the reps at max weight
          if (curr.weight === acc[existingEntryIndex].weight && curr.reps > acc[existingEntryIndex].reps) {
            acc[existingEntryIndex].reps = curr.reps;
          }
        } else {
          // Add a new entry
          acc.push({
            date: curr.date,
            weight: curr.weight,
            reps: curr.reps,
            formattedDate: format(parseISO(curr.date), 'MMM dd')
          });
        }
        
        return acc;
      }, []);
      
      // Sort by date
      processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate trend
      if (processedData.length >= 2) {
        const firstWeight = processedData[0].weight;
        const lastWeight = processedData[processedData.length - 1].weight;
        const weightChange = lastWeight - firstWeight;
        const percentChange = firstWeight > 0 ? (weightChange / firstWeight) * 100 : 0;
        
        setMetrics({
          trend: weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'neutral',
          change: Math.abs(percentChange),
          maxWeight: Math.max(...processedData.map((item: any) => item.weight))
        });
      } else {
        setMetrics({ trend: 'neutral', change: 0, maxWeight: 0 });
      }
      
      setFilteredData(processedData);
    }
  }, [selectedExercise, data]);

  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
          <CardDescription>
            Track your progress with specific exercises over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    weight: { color: "#7c3aed" },
    reps: { color: "#60a5fa" }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Exercise Progress</CardTitle>
        <CardDescription>
          Track your progress with specific exercises over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Select
            value={selectedExercise}
            onValueChange={setSelectedExercise}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exerciseNames.map(name => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {metrics.trend !== 'neutral' && (
            <div className="flex items-center">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                metrics.trend === 'up' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {metrics.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                <span>
                  {metrics.change.toFixed(1)}% {metrics.trend === 'up' ? 'increase' : 'decrease'}
                </span>
              </div>
              <div className="ml-3 text-sm">
                Max weight: {metrics.maxWeight} kg
              </div>
            </div>
          )}
        </div>
        
        {filteredData.length > 0 ? (
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip
                    content={({ active, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        labelFormatter={(value) => `Date: ${value}`}
                      />
                    )}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="Weight (kg)"
                    stroke="#7c3aed"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="reps"
                    name="Reps"
                    stroke="#60a5fa"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              Select an exercise to view progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
