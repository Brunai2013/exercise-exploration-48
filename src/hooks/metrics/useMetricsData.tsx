
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
  refreshKey: number = 0,
  disableDemoData: boolean = false
) {
  // Get base data (fetches from API)
  const { 
    rawWorkoutData, 
    isLoading, 
    error, 
    shouldUseDemoData, 
    validDateRange 
  } = useBaseMetricsData(dateRange, refreshKey, disableDemoData);
  
  // Get specific data types using the specialized hooks
  const { muscleGroupData } = useMuscleGroupData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { exerciseData } = useExerciseProgressData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { frequencyData } = useFrequencyData(rawWorkoutData, shouldUseDemoData, dateRange, view);
  
  // Pass shouldUseDemoData to useUpcomingAnalysis
  const { upcomingWorkoutData } = useUpcomingAnalysis(rawWorkoutData, shouldUseDemoData);

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  };
}
