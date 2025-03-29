import { useState, useEffect, useMemo } from 'react';
import { format, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { getWorkoutsForMetrics } from '@/lib/workout/metrics-queries';

export function useBaseMetricsData(
  dateRange: { from: Date; to: Date },
  refreshKey: number = 0,
  disableDemoData: boolean = false // Parameter to explicitly disable demo data
) {
  const [rawWorkoutData, setRawWorkoutData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldUseDemoData, setShouldUseDemoData] = useState(false);
  
  // Validate date range to ensure from is before to
  const validDateRange = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      console.error('Invalid date range provided:', dateRange);
      return false;
    }
    
    // Ensure both dates are valid Date objects
    if (!(dateRange.from instanceof Date) || !(dateRange.to instanceof Date)) {
      console.error('Date range contains invalid Date objects:', dateRange);
      return false;
    }
    
    // Check if dates are valid according to date-fns
    if (!isValid(dateRange.from) || !isValid(dateRange.to)) {
      console.error('Date range contains invalid dates:', dateRange);
      return false;
    }
    
    // Check if from date is before to date
    if (isAfter(dateRange.from, dateRange.to)) {
      console.error('From date is after to date:', dateRange);
      return false;
    }
    
    return true;
  }, [dateRange]);

  // Fetch data whenever date range changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!validDateRange) {
        setIsLoading(false);
        setError('Invalid date range provided');
        console.error('Invalid date range, skipping data fetch');
        setShouldUseDemoData(!disableDemoData); // Only use demo data if not disabled
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        // Log date range and demo data status for debugging
        console.log('Fetching data with date range:', { 
          from: fromDate, 
          to: toDate,
          disableDemoData 
        });
        
        // Use our specialized function to get workouts for metrics
        const workoutData = await getWorkoutsForMetrics(fromDate, toDate);
        
        if (isMounted) {
          if (workoutData && workoutData.length > 0) {
            console.log(`Processing ${workoutData.length} workouts for metrics`);
            setRawWorkoutData(workoutData);
            // IMPORTANT: Force demo data to be off when we have real data AND disableDemoData is true
            setShouldUseDemoData(false);
          } else {
            console.log('No real workout data found for metrics, checking if demo data is allowed');
            // Only use demo data if not explicitly disabled
            setShouldUseDemoData(!disableDemoData);
            setRawWorkoutData([]);
          }
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching metrics data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error fetching data');
          // Only use demo data if not explicitly disabled
          setShouldUseDemoData(!disableDemoData);
          setRawWorkoutData([]);
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, [dateRange.from, dateRange.to, refreshKey, validDateRange, disableDemoData]);

  return {
    rawWorkoutData,
    isLoading,
    error,
    shouldUseDemoData,
    validDateRange
  };
}
