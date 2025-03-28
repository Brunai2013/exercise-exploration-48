
import { useState, useEffect } from 'react';
import { format, parseISO, isAfter } from 'date-fns';

export interface FrequencyData {
  name: string;
  workouts: number;
  date: string;
}

export function useFrequencyData(
  rawWorkoutData: any[],
  shouldUseDemoData: boolean,
  dateRange: { from: Date; to: Date },
  view: 'weekly' | 'monthly'
) {
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  
  // Process workout data into frequency statistics
  useEffect(() => {
    // Important: Clear data first when switching modes
    setFrequencyData([]);
    
    if (!shouldUseDemoData && rawWorkoutData.length > 0) {
      console.log('Processing real frequency data with', rawWorkoutData.length, 'workouts');
      processFrequencyData(rawWorkoutData, view);
    } else if (shouldUseDemoData) {
      console.log('Generating demo frequency data');
      generateDemoFrequencyData();
    } else {
      console.log('No workout data and demo data disabled - showing empty frequency data');
    }
  }, [rawWorkoutData, shouldUseDemoData, view, dateRange]);
  
  const processFrequencyData = (workoutData: any[], currentView: 'weekly' | 'monthly') => {
    try {
      // Group workouts by week or month
      const frequencyMap: Record<string, { count: number, date: string }> = {};
      
      workoutData.forEach(workout => {
        if (!workout.date) return;
        
        let period: string;
        const workoutDate = parseISO(workout.date);
        
        if (currentView === 'weekly') {
          // Format as 'YYYY-WW' (year and week number)
          const weekNumber = Math.ceil(workoutDate.getDate() / 7);
          period = `${format(workoutDate, 'yyyy')}-W${weekNumber}`;
        } else {
          // Format as 'YYYY-MM' (year and month)
          period = format(workoutDate, 'yyyy-MM');
        }
        
        if (!frequencyMap[period]) {
          frequencyMap[period] = { count: 0, date: workout.date };
        }
        frequencyMap[period].count++;
      });
      
      // Convert to required format
      const processedData = Object.entries(frequencyMap).map(([period, data]) => {
        const [year, subPeriod] = period.split('-');
        const displayName = currentView === 'weekly' 
          ? `Week ${subPeriod.substring(1)}` 
          : format(parseISO(data.date), 'MMM yyyy');
        
        return {
          name: displayName,
          workouts: data.count,
          date: data.date
        };
      }).sort((a, b) => {
        // Sort by date (ascending)
        return parseISO(a.date) > parseISO(b.date) ? 1 : -1;
      });
      
      console.log('Processed frequency data:', processedData.length);
      setFrequencyData(processedData);
    } catch (err) {
      console.error('Error processing frequency data:', err);
      // Set to empty array instead of showing demo data
      setFrequencyData([]);
    }
  };
  
  const generateDemoFrequencyData = () => {
    // Generate frequency data based on view type
    const frequencyMap: Record<string, number> = {};
    const demoFrequencyData: FrequencyData[] = [];
    
    // Get start and end dates
    const startDate = dateRange.from;
    const endDate = dateRange.to;
    const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Use the same date range as exercise data
    for (let i = 0; i < daysBetween; i += 2) { // Every other day (workouts)
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Don't create dates in the future
      if (isAfter(currentDate, new Date())) continue;
      
      let period: string;
      
      if (view === 'weekly') {
        // Group by week
        const weekNumber = Math.ceil(currentDate.getDate() / 7);
        period = `Week ${weekNumber}`;
      } else {
        // Group by month
        period = format(currentDate, 'MMM yyyy');
      }
      
      if (!frequencyMap[period]) {
        frequencyMap[period] = 0;
      }
      frequencyMap[period]++;
      
      // Add to the frequency data array (overwriting previous entries for the same period)
      const existingIndex = demoFrequencyData.findIndex(item => item.name === period);
      if (existingIndex >= 0) {
        demoFrequencyData[existingIndex] = {
          name: period,
          workouts: frequencyMap[period],
          date: format(currentDate, 'yyyy-MM-dd')
        };
      } else {
        demoFrequencyData.push({
          name: period,
          workouts: frequencyMap[period],
          date: format(currentDate, 'yyyy-MM-dd')
        });
      }
    }
    
    // Sort frequency data by date
    demoFrequencyData.sort((a, b) => {
      return parseISO(a.date) > parseISO(b.date) ? 1 : -1;
    });
    
    setFrequencyData(demoFrequencyData);
  };

  return { frequencyData };
}
