
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { LineChartIcon, ArrowUp, ArrowDown, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO, format } from "date-fns";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
      setExerciseNames(names.sort());
      
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
      
      // Group by date to get a more representative view
      const dataByDate = exerciseData.reduce((acc: Record<string, any>, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = {
            date: curr.date,
            formattedDate: format(parseISO(curr.date), 'MMM dd, yyyy'),
            weight: curr.weight,
            reps: curr.reps
          };
        } else if (curr.weight > acc[curr.date].weight) {
          // Update if we have a higher weight for this date
          acc[curr.date].weight = curr.weight;
          acc[curr.date].reps = curr.reps;
        }
        return acc;
      }, {});
      
      // Convert to array and sort by date
      const processedData = Object.values(dataByDate);
      processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate trend
      if (processedData.length >= 2) {
        const firstEntry = processedData[0];
        const lastEntry = processedData[processedData.length - 1];
        
        const weightChange = lastEntry.weight - firstEntry.weight;
        const percentChange = firstEntry.weight > 0 ? (weightChange / firstEntry.weight) * 100 : 0;
        
        setMetrics({
          trend: weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'neutral',
          change: Math.abs(percentChange),
          maxWeight: Math.max(...processedData.map((item: any) => item.weight))
        });
      } else {
        setMetrics({ trend: 'neutral', change: 0, maxWeight: processedData[0]?.weight || 0 });
      }
      
      setFilteredData(processedData);
    } else {
      setFilteredData([]);
    }
  }, [selectedExercise, data]);

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
                Track your progress with specific exercises over time
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
                    Track your strength progress with specific exercises over time.
                    The chart shows weight (kg) and reps for each completed workout.
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

  const chartConfig = {
    weight: { color: "#7c3aed" },
    reps: { color: "#60a5fa" }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription>
              Track your progress with specific exercises over time
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
                  Select an exercise from the dropdown to view your progress over time.
                  The chart shows weight (left axis) and reps (right axis) for each workout.
                  The percentage shows your overall progress from first to most recent workout.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
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
          
          {metrics.trend !== 'neutral' && filteredData.length > 1 && (
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
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={['dataMin - 5', 'dataMax + 5']}
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[0, 'dataMax + 2']}
                    label={{ value: 'Reps', angle: 90, position: 'insideRight' }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        labelFormatter={(value) => `Date: ${value}`}
                      />
                    )}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="Weight (kg)"
                    stroke="#7c3aed"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    connectNulls
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="reps"
                    name="Reps"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              {exerciseNames.length > 0 
                ? "Select an exercise to view progress"
                : "No exercise data available in the selected date range"}
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Showing data for <strong>{selectedExercise}</strong> from {filteredData[0]?.formattedDate} to {filteredData[filteredData.length - 1]?.formattedDate}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
