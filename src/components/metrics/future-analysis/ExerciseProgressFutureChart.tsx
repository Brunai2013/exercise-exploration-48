
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { EmptyState, LoadingState } from "@/components/metrics/exercise-progress/ChartStates";
import FutureExerciseChartHeader from "./FutureExerciseChartHeader";
import ExerciseBreakdownGrid from "./ExerciseBreakdownGrid";
import ExerciseBadges from "./ExerciseBadges";
import FutureTipSection from "./FutureTipSection";

interface ExerciseProgressFutureChartProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const ExerciseProgressFutureChart: React.FC<ExerciseProgressFutureChartProps> = ({ 
  data, 
  isLoading
}) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  // Process data for exercise breakdown
  const exerciseData = React.useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No future exercise data available to process');
      return [];
    }
    
    console.log('Processing future exercise data:', data.length, 'items');
    
    // Create exercise data from category analysis data
    return data
      .map(item => ({
        id: item.id,
        name: item.name,
        value: item.futureCount || 0,
        percentage: item.futurePercentage || 0,
        category: item.category,
        color: item.color || '#6366F1',
        displayText: `${item.futurePercentage || 0}% (${item.futureCount || 0} time${item.futureCount !== 1 ? 's' : ''})`
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by count, descending
  }, [data]);
  
  // Check if we have any data to display
  const hasData = exerciseData && exerciseData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <FutureExerciseChartHeader />
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <FutureExerciseChartHeader />
      <CardContent>
        <h3 className="font-medium text-gray-700 text-lg mb-4">Exercise Breakdown</h3>
        
        <ExerciseBreakdownGrid exerciseData={exerciseData} />
        <ExerciseBadges exerciseData={exerciseData} />
        <FutureTipSection />
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressFutureChart;
