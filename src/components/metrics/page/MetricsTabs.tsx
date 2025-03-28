
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dumbbell, LineChart, BarChart3 } from 'lucide-react';
import MuscleGroupsChart from '@/components/metrics/muscle-groups/MuscleGroupsChart';
import ExerciseProgressChart from '@/components/metrics/exercise-progress/ExerciseProgressChart';
import WorkoutFrequencyChart from '@/components/metrics/WorkoutFrequencyChart';
import { FrequencyData, MuscleGroupData, ExerciseProgressItem, CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import MuscleGroupsFutureChart from '@/components/metrics/future-analysis/MuscleGroupsFutureChart';
import ExerciseProgressFutureChart from '@/components/metrics/future-analysis/ExerciseProgressFutureChart';
import WorkoutFrequencyFutureChart from '@/components/metrics/future-analysis/WorkoutFrequencyFutureChart';

interface MetricsTabsProps {
  muscleGroupData: MuscleGroupData[];
  exerciseData: ExerciseProgressItem[];
  frequencyData: FrequencyData[];
  upcomingWorkoutData: CategoryAnalysis[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
  futureDays?: number;
}

const MetricsTabs: React.FC<MetricsTabsProps> = ({
  muscleGroupData,
  exerciseData,
  frequencyData,
  upcomingWorkoutData,
  isLoading,
  view,
  dateRange,
  timeFilter,
  futureDays = 7
}) => {
  return (
    <Tabs defaultValue="exercises" className="w-full mb-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="muscle-groups" className="flex items-center justify-center">
          <Dumbbell className="w-4 h-4 mr-2" />
          Muscle Groups
        </TabsTrigger>
        <TabsTrigger value="exercises" className="flex items-center justify-center">
          <LineChart className="w-4 h-4 mr-2" />
          Exercises
        </TabsTrigger>
        <TabsTrigger value="frequency" className="flex items-center justify-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Workout Frequency
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="muscle-groups" className="mt-6 space-y-8">
        <MuscleGroupsChart 
          data={muscleGroupData} 
          isLoading={isLoading}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
        
        <MuscleGroupsFutureChart 
          data={upcomingWorkoutData}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="exercises" className="mt-6 space-y-8">
        <ExerciseProgressChart 
          data={exerciseData} 
          isLoading={isLoading}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
        
        <ExerciseProgressFutureChart 
          data={upcomingWorkoutData}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="frequency" className="mt-6 space-y-8">
        <WorkoutFrequencyChart 
          data={frequencyData} 
          isLoading={isLoading} 
          view={view}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
        
        <WorkoutFrequencyFutureChart 
          data={upcomingWorkoutData}
          isLoading={isLoading}
          view={view}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MetricsTabs;
