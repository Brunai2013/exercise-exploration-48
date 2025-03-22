
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { InfoIcon, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getAllWorkouts } from '@/lib/workout/queries';
import { Workout, WorkoutExercise } from '@/lib/types';
import { parseISO, isAfter } from 'date-fns';

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

interface ExerciseCount {
  name: string;
  count: number;
  color: string;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-60 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <LineChart className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No upcoming exercise data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see your planned exercise distribution
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-32 mt-1" />
    <Skeleton className="h-[200px] w-full rounded-lg mt-4" />
  </div>
);

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ data, isLoading }) => {
  // Initialize state variables at the top level
  const [futureExercises, setFutureExercises] = useState<ExerciseCount[]>([]);
  const [hasFutureData, setHasFutureData] = useState(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  
  // Fetch future workouts and count exercises
  useEffect(() => {
    const fetchFutureExercises = async () => {
      try {
        setIsLoadingExercises(true);
        const allWorkouts = await getAllWorkouts();
        
        // Filter for future workouts
        const today = new Date();
        const futureWorkouts = allWorkouts.filter(workout => {
          const workoutDate = parseISO(workout.date);
          return isAfter(workoutDate, today);
        });
        
        // Count exercises by name
        const exerciseCountMap = new Map<string, { count: number, color: string }>();
        const colorPool = [
          '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
          '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c44dff'
        ];
        
        futureWorkouts.forEach(workout => {
          workout.exercises.forEach(exercise => {
            const exerciseName = exercise.exercise.name;
            
            if (!exerciseCountMap.has(exerciseName)) {
              const colorIndex = exerciseCountMap.size % colorPool.length;
              exerciseCountMap.set(exerciseName, { 
                count: 0,
                color: colorPool[colorIndex]
              });
            }
            
            const currentCount = exerciseCountMap.get(exerciseName)!;
            exerciseCountMap.set(exerciseName, {
              ...currentCount,
              count: currentCount.count + 1
            });
          });
        });
        
        // Convert map to array and sort by count
        const exercisesArray = Array.from(exerciseCountMap).map(([name, details]) => ({
          name,
          count: details.count,
          color: details.color
        }));
        
        exercisesArray.sort((a, b) => b.count - a.count);
        
        // Take the top 10 exercises for better visualization
        const topExercises = exercisesArray.slice(0, 10);
        
        setFutureExercises(topExercises);
        setHasFutureData(topExercises.length > 0);
        setIsLoadingExercises(false);
      } catch (error) {
        console.error('Error fetching future exercises:', error);
        setIsLoadingExercises(false);
      }
    };
    
    fetchFutureExercises();
  }, []);
  
  // Handle loading states
  if (isLoading || isLoadingExercises) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Handle empty state
  if (!hasFutureData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Exercise Distribution</CardTitle>
              <CardDescription>
                See what exercises you've planned for the future
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
                    This chart shows the distribution of specific exercises in your upcoming scheduled workouts.
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

  // Prepare data for the chart
  const chartData = futureExercises.map(item => ({
    name: item.name,
    exercises: item.count,
    fill: item.color
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Exercise Distribution</CardTitle>
            <CardDescription>
              See what specific exercises you've planned for the future
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
                  This shows the distribution of specific exercises in your upcoming workouts.
                  It helps you see what exercises you're planning to focus on.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Times Scheduled', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                formatter={(value) => [`${value} times`, 'Scheduled']}
                labelFormatter={(label) => `Exercise: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="exercises" 
                name="Scheduled Times" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 px-4 py-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">Pro Tip:</span> This shows your top 10 most frequently scheduled exercises for upcoming workouts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
