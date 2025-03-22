
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis, Brush } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

// Get unique dates from the data
const getUniqueDates = (data: ExerciseProgressItem[]) => {
  const dates = new Set(data.map(item => item.date));
  return Array.from(dates).sort();
};

// Get unique exercises from the data
const getUniqueExercises = (data: ExerciseProgressItem[]) => {
  const exercises = new Set(data.map(item => item.exercise));
  return Array.from(exercises).sort();
};

// Main component
const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  // Initialize all hooks at the top level to ensure consistent rendering
  const [view, setView] = useState<'overview' | 'weight' | 'reps'>('overview');

  // Format date range for display
  const dateRangeText = useMemo(() => {
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);

  const timeDescription = useMemo(() => {
    return timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText;
  }, [timeFilter, dateRangeText]);

  // Always define exerciseSummary and exerciseColors even if data is empty
  const uniqueExercises = useMemo(() => getUniqueExercises(data), [data]);
  const uniqueDates = useMemo(() => getUniqueDates(data), [data]);

  // Colors for each exercise - always define this hook
  const exerciseColors = useMemo(() => {
    const colors = [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
      '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c44dff'
    ];
    
    const colorMap: Record<string, string> = {};
    uniqueExercises.forEach((exercise, index) => {
      colorMap[exercise] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [uniqueExercises]);

  // Prepare summary data - always define this hook
  const exerciseSummary = useMemo(() => {
    const summary: Record<string, { maxWeight: number, maxReps: number, latestWeight: number, latestReps: number }> = {};
    
    uniqueExercises.forEach(exercise => {
      const exerciseData = data.filter(item => item.exercise === exercise);
      const maxWeight = exerciseData.length ? Math.max(...exerciseData.map(item => item.weight)) : 0;
      const maxReps = exerciseData.length ? Math.max(...exerciseData.map(item => item.reps)) : 0;
      
      // Find the latest data point
      const sortedData = [...exerciseData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      summary[exercise] = {
        maxWeight,
        maxReps,
        latestWeight: sortedData[0]?.weight || 0,
        latestReps: sortedData[0]?.reps || 0
      };
    });
    
    return summary;
  }, [data, uniqueExercises]);

  // Early return for loading state
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Prepare data for the overview scatter chart
  const scatterData = data.map(item => ({
    date: format(parseISO(item.date), 'MM/dd'),
    fullDate: item.date,
    exercise: item.exercise,
    weight: item.weight,
    reps: item.reps,
    size: (item.weight * item.reps) / 20, // Size based on volume (weight × reps)
    category: item.category
  }));

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
                <h4 className="text-sm font-semibold">About These Charts</h4>
                <p className="text-sm">
                  <strong>Overview:</strong> Shows all exercises as bubbles. Larger bubbles mean higher volume (weight × reps).
                  <br /><br />
                  <strong>Weight Trends:</strong> Compare how weights for different exercises change over time.
                  <br /><br />
                  <strong>Rep Trends:</strong> See how your reps for different exercises change over time.
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
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weight">Weight Trends</TabsTrigger>
              <TabsTrigger value="reps">Rep Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      dataKey="date" 
                      name="Date"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="exercise" 
                      name="Exercise" 
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={120}
                    />
                    <ZAxis 
                      dataKey="size" 
                      range={[50, 500]} 
                      name="Volume"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        if (name === 'Volume') {
                          if (typeof value === 'number') {
                            return [`${value.toFixed(1)}`, 'Volume'];
                          }
                          return [value, 'Volume'];
                        }
                        return [value, name];
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-md">
                              <p className="font-semibold">{data.exercise}</p>
                              <p className="text-sm">{format(parseISO(data.fullDate), 'MMM d, yyyy')}</p>
                              <p className="text-sm">Weight: {data.weight} lbs</p>
                              <p className="text-sm">Reps: {data.reps}</p>
                              <p className="text-sm">Volume: {(data.weight * data.reps).toFixed(1)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Scatter 
                      name="Exercises" 
                      data={scatterData} 
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(exerciseSummary).slice(0, 6).map(([exercise, summary]) => (
                  <div 
                    key={exercise}
                    className="bg-gray-50 p-3 rounded-lg border"
                    style={{ borderLeft: `4px solid ${exerciseColors[exercise] || '#8884d8'}` }}
                  >
                    <p className="font-medium truncate" title={exercise}>{exercise}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Latest Weight</p>
                        <p className="font-semibold">{summary.latestWeight} lbs</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Latest Reps</p>
                        <p className="font-semibold">{summary.latestReps}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="weight">
              <div className="h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      type="category"
                      allowDuplicatedCategory={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Weight (lbs)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} lbs`, name]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                    
                    {/* Create a line for each exercise */}
                    {uniqueExercises.slice(0, 10).map((exercise) => {
                      // Filter data for this exercise and format for the chart
                      const lineData = uniqueDates.map(date => {
                        const exerciseOnDate = data.find(
                          item => item.date === date && item.exercise === exercise
                        );
                        
                        return {
                          date: format(parseISO(date), 'MM/dd'),
                          [exercise]: exerciseOnDate ? exerciseOnDate.weight : null
                        };
                      }).filter(item => item[exercise] !== null);

                      if (lineData.length > 0) {
                        return (
                          <Line
                            key={exercise}
                            type="monotone"
                            dataKey={exercise}
                            data={lineData}
                            name={exercise}
                            stroke={exerciseColors[exercise]}
                            activeDot={{ r: 8 }}
                            connectNulls
                            strokeWidth={2}
                          />
                        );
                      }
                      return null;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="reps">
              <div className="h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      type="category"
                      allowDuplicatedCategory={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Reps', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} reps`, name]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                    
                    {/* Create a line for each exercise */}
                    {uniqueExercises.slice(0, 10).map((exercise) => {
                      // Filter data for this exercise and format for the chart
                      const lineData = uniqueDates.map(date => {
                        const exerciseOnDate = data.find(
                          item => item.date === date && item.exercise === exercise
                        );
                        
                        return {
                          date: format(parseISO(date), 'MM/dd'),
                          [exercise]: exerciseOnDate ? exerciseOnDate.reps : null
                        };
                      }).filter(item => item[exercise] !== null);

                      if (lineData.length > 0) {
                        return (
                          <Line
                            key={exercise}
                            type="monotone"
                            dataKey={exercise}
                            data={lineData}
                            name={exercise}
                            stroke={exerciseColors[exercise]}
                            activeDot={{ r: 8 }}
                            connectNulls
                            strokeWidth={2}
                          />
                        );
                      }
                      return null;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        <div className="mt-6 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold">Pro Tip:</span> The overview shows all your exercises at once. Switch to Weight or Rep trends to compare specific exercises over time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
