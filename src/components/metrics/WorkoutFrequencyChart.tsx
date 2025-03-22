
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FrequencyData } from "@/hooks/metrics/useMetricsData";
import { LoadingState, EmptyStateCard } from './workout-frequency/EmptyAndLoadingStates';
import StatsCards from './workout-frequency/StatsCards';
import FrequencyChart from './workout-frequency/FrequencyChart';
import InfoSection from './workout-frequency/InfoSection';
import HeaderSection from './workout-frequency/HeaderSection';

interface WorkoutFrequencyChartProps {
  data: FrequencyData[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const WorkoutFrequencyChart: React.FC<WorkoutFrequencyChartProps> = ({ 
  data, 
  isLoading, 
  view,
  dateRange,
  timeFilter
}) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return <EmptyStateCard view={view} timeFilter={timeFilter} dateRange={dateRange} />;
  }

  const totalWorkouts = data.reduce((sum, item) => sum + item.workouts, 0);
  const mostActiveIndex = data.reduce((maxIndex, item, index, arr) => 
    item.workouts > arr[maxIndex].workouts ? index : maxIndex, 0);
  const mostActivePeriod = data[mostActiveIndex];
  const avgWorkoutsPerPeriod = totalWorkouts / data.length || 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <HeaderSection 
          view={view} 
          timeFilter={timeFilter} 
          dateRange={dateRange} 
        />
      </CardHeader>

      <CardContent className="pt-4">
        {/* Stats summary cards */}
        <StatsCards 
          totalWorkouts={totalWorkouts}
          mostActivePeriod={mostActivePeriod}
          avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
          view={view}
        />
        
        {/* Main chart */}
        <FrequencyChart 
          data={data} 
          avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
          view={view}
        />

        {/* Explanation section */}
        <InfoSection avgWorkoutsPerPeriod={avgWorkoutsPerPeriod} />
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
