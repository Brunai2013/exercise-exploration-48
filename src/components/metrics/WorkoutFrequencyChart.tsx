
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
  // Add debug logging to track data flow
  console.log('WorkoutFrequencyChart: Received data items:', data?.length || 0, 
    'isLoading:', isLoading);

  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Be extra strict about checking for data - check length explicitly
  if (!data || data.length === 0) {
    console.log('WorkoutFrequencyChart: No data available, showing empty state');
    return <EmptyStateCard view={view} timeFilter={timeFilter} dateRange={dateRange} />;
  }

  const totalWorkouts = data.reduce((sum, item) => sum + item.workouts, 0);
  const mostActiveIndex = data.reduce((maxIndex, item, index, arr) => 
    item.workouts > arr[maxIndex].workouts ? index : maxIndex, 0);
  const mostActivePeriod = data[mostActiveIndex];
  const avgWorkoutsPerPeriod = totalWorkouts / data.length || 0;

  return (
    <Card className="overflow-hidden h-full shadow-sm">
      <CardContent className="p-0">
        {/* Header with title and info */}
        <HeaderSection 
          view={view} 
          timeFilter={timeFilter} 
          dateRange={dateRange} 
        />
        
        {/* Stats summary cards */}
        <div className="p-6 pt-0">
          <StatsCards 
            totalWorkouts={totalWorkouts}
            mostActivePeriod={mostActivePeriod}
            avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
            view={view}
          />
        </div>
        
        {/* Main chart */}
        <div className="px-6 pb-6">
          <FrequencyChart 
            data={data} 
            avgWorkoutsPerPeriod={avgWorkoutsPerPeriod}
            view={view}
          />
        </div>
        
        {/* Pro Tip section similar to Muscle Groups */}
        <div className="px-6 pb-6">
          <div className="px-6 py-5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-base text-blue-800 leading-relaxed">
              <span className="font-semibold">Pro Tip:</span> Consistency is key for long-term fitness results. 
              Aim for 3-4 workouts per week for optimal progress while allowing proper recovery.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
