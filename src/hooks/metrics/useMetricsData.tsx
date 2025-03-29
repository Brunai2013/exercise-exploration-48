
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
  disableDemoData: boolean = false, // Parameter with default value of false
  futureDays: number = 7 // Parameter with default value of 7 days
) {
  // Get base data (fetches from API)
  const { 
    rawWorkoutData, 
    isLoading, 
    error, 
    shouldUseDemoData, 
    validDateRange 
  } = useBaseMetricsData(dateRange, refreshKey, disableDemoData);
  
  console.log('useMetricsData - Base data loaded:', {
    workoutCount: rawWorkoutData?.length || 0,
    shouldUseDemoData,
    isLoading,
    error: error ? 'Error present' : 'No error',
    disableDemoData, // Log whether demo data is explicitly disabled
    futureDays, // Log the future days value
    dateRange: {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    }
  });
  
  // Get specific data types using the specialized hooks
  const { muscleGroupData } = useMuscleGroupData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { exerciseData } = useExerciseProgressData(rawWorkoutData, shouldUseDemoData, dateRange);
  const { frequencyData } = useFrequencyData(rawWorkoutData, shouldUseDemoData, dateRange, view);
  
  // Pass shouldUseDemoData correctly - ensure we respect the disableDemoData flag
  const { upcomingWorkoutData } = useUpcomingAnalysis(rawWorkoutData, shouldUseDemoData, futureDays);
  
  console.log('useMetricsData - Data processed:', {
    muscleGroupCount: muscleGroupData?.length || 0,
    exerciseCount: exerciseData?.length || 0,
    frequencyCount: frequencyData?.length || 0,
    upcomingCount: upcomingWorkoutData?.length || 0,
    shouldUseDemoData,
    disableDemoData, // Log whether demo data is explicitly disabled
    futureDays, // Log the future days value
    dateRange: {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    }
  });

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  };
}
