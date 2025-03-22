
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {/* Header with title and info */}
          <HeaderSection 
            view={view} 
            timeFilter={timeFilter} 
            dateRange={dateRange} 
          />
          
          {/* Stats summary cards */}
          <div className="mt-6">
            <StatsCards 
              totalWorkouts={totalWorkouts}
              mostActivePeriod={mostActivePeriod}
              avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
              view={view}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Main chart in its own card */}
      <FrequencyChart 
        data={data} 
        avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
        view={view}
      />
      
      {/* Explanation section */}
      <InfoSection avgWorkoutsPerPeriod={avgWorkoutsPerPeriod} />
    </div>
  );
};

export default WorkoutFrequencyChart;
