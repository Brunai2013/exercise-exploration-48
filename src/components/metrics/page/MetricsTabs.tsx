
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dumbbell, LineChart, BarChart3 } from 'lucide-react';
import MuscleGroupsChart from '@/components/metrics/muscle-groups/MuscleGroupsChart';
import ExerciseProgressChart from '@/components/metrics/exercise-progress/ExerciseProgressChart';
import WorkoutFrequencyChart from '@/components/metrics/WorkoutFrequencyChart';
import { FrequencyData, MuscleGroupData, ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";

interface MetricsTabsProps {
  muscleGroupData: MuscleGroupData[];
  exerciseData: ExerciseProgressItem[];
  frequencyData: FrequencyData[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const MetricsTabs: React.FC<MetricsTabsProps> = ({
  muscleGroupData,
  exerciseData,
  frequencyData,
  isLoading,
  view,
  dateRange,
  timeFilter
}) => {
  return (
    <Tabs defaultValue="muscle-groups" className="w-full mb-8">
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
      
      <TabsContent value="muscle-groups" className="mt-6">
        <MuscleGroupsChart 
          data={muscleGroupData} 
          isLoading={isLoading}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
      </TabsContent>
      
      <TabsContent value="exercises" className="mt-6">
        <ExerciseProgressChart 
          data={exerciseData} 
          isLoading={isLoading}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
      </TabsContent>
      
      <TabsContent value="frequency" className="mt-6">
        <WorkoutFrequencyChart 
          data={frequencyData} 
          isLoading={isLoading} 
          view={view}
          dateRange={dateRange}
          timeFilter={timeFilter}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MetricsTabs;
