
import { useBaseMetricsData } from './useBaseMetricsData';
import { useMuscleGroupData, MuscleGroupData } from './useMuscleGroupData';
import { useExerciseProgressData, ExerciseProgressItem } from './useExerciseProgressData';
import { useFrequencyData, FrequencyData } from './useFrequencyData';
import { useUpcomingAnalysis, CategoryAnalysis } from './useUpcomingAnalysis';

// Re-export types for external use
export type { MuscleGroupData, ExerciseProgressItem, FrequencyData, CategoryAnalysis };

export function useMetricsData(
  dateRange: { from: Date; to: Date },
  view: 'weekly' | 'monthly',
  refreshKey: number = 0
) {
  // Get base data (fetches from API)
  const { 
    rawWorkoutData, 
    isLoading, 
    error, 
    shouldUseDemoData, 
    validDateRange 
  } = useBaseMetricsData(dateRange, refreshKey);
  
  // Get specific data types using the specialized hooks
  const { muscleGroupData } = useMuscleGroupData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { exerciseData } = useExerciseProgressData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { frequencyData } = useFrequencyData(rawWorkoutData, shouldUseDemoData, dateRange, view);
  const { upcomingWorkoutData } = useUpcomingAnalysis(rawWorkoutData);

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  };
}
