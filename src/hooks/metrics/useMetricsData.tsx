
import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, getWeek, getMonth } from 'date-fns';
import { getAllWorkouts } from '@/lib/workouts';
import { getCategoryById } from '@/lib/categories';
import { Workout } from '@/lib/types';

export type MetricsDateRange = {
  from: Date;
  to: Date;
};

export interface MuscleGroupData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ExerciseProgressItem {
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  category: string;
}

export interface FrequencyData {
  name: string;
  workouts: number;
  color: string;
}

export interface CategoryAnalysis {
  id: string;
  category: string;
  pastCount: number;
  futureCount: number;
  pastPercentage: number;
  futurePercentage: number;
  suggestion: 'increase' | 'decrease' | 'maintain';
  color: string;
}

export const useMetricsData = (
  dateRange: MetricsDateRange,
  view: 'weekly' | 'monthly',
  refreshKey = 0 // Add refresh key to force data reload
) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([]);
  const [exerciseData, setExerciseData] = useState<ExerciseProgressItem[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workouts - add debug logs
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching workouts for metrics with date range:', {
          from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'undefined',
          to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'undefined'
        });
        
        // Validate date range
        if (!dateRange || !dateRange.from || !dateRange.to) {
          console.log('Invalid date range, using demo data');
          setMuscleGroupData(generateDemoMuscleGroupData());
          setExerciseData(generateDemoExerciseData());
          setFrequencyData(generateDemoFrequencyData(view));
          setUpcomingWorkoutData(generateDemoUpcomingData());
          setIsLoading(false);
          return;
        }
        
        const allWorkouts = await getAllWorkouts();
        console.log('Fetched workouts count:', allWorkouts.length);
        
        // For debugging - show details of first few workouts
        if (allWorkouts.length > 0) {
          console.log('Sample workout data:', allWorkouts.slice(0, 2).map(w => ({
            id: w.id,
            name: w.name,
            date: w.date,
            completed: w.completed,
            exerciseCount: w.exercises?.length || 0
          })));
        } else {
          console.log('No workouts found in the database');
          // Create demo data immediately if no workouts exist
          setMuscleGroupData(generateDemoMuscleGroupData());
          setExerciseData(generateDemoExerciseData());
          setFrequencyData(generateDemoFrequencyData(view));
          setUpcomingWorkoutData(generateDemoUpcomingData());
          setIsLoading(false);
          return; // Exit early since we've already set demo data
        }
        
        setWorkouts(allWorkouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Failed to load workout data. Please try again later.');
        // Generate demo data on error to show UI
        setMuscleGroupData(generateDemoMuscleGroupData());
        setExerciseData(generateDemoExerciseData());
        setFrequencyData(generateDemoFrequencyData(view));
        setUpcomingWorkoutData(generateDemoUpcomingData());
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [refreshKey, dateRange]); // Add dateRange to dependencies to refresh when it changes

  // Process the data for muscle groups
  useEffect(() => {
    if (!workouts.length) {
      console.log('No workouts to process for muscle groups');
      return;
    }

    // Guard against invalid date ranges
    if (!dateRange || !dateRange.from || !dateRange.to) {
      console.log('Invalid date range for muscle groups, using demo data');
      setMuscleGroupData(generateDemoMuscleGroupData());
      return;
    }

    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categoryMap: Record<string, { id: string; count: number; color: string }> = {};
        let totalExerciseCount = 0;

        // Get completed workouts within the date range
        const filteredWorkouts = workouts.filter(workout => {
          if (!workout.completed) return false;
          const workoutDate = parseISO(workout.date);
          return workoutDate >= dateRange.from && workoutDate <= dateRange.to;
        });
        
        console.log('Filtered workouts for muscle groups:', filteredWorkouts.length);

        // If no workouts in range, use demo data
        if (filteredWorkouts.length === 0) {
          setMuscleGroupData(generateDemoMuscleGroupData());
          return;
        }

        // Count exercises by category
        for (const workout of filteredWorkouts) {
          for (const exercise of workout.exercises) {
            // Only count exercises with completed sets
            const completedSets = exercise.sets.filter(set => set.completed).length;
            if (completedSets === 0) continue;

            const categoryId = exercise.exercise.category;
            if (!categoryId) continue;

            if (!categoryMap[categoryId]) {
              try {
                // Get the category color from the database
                const category = await getCategoryById(categoryId);
                const hue = Math.abs((categoryId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
                
                categoryMap[categoryId] = { 
                  id: categoryId,
                  count: 0, 
                  color: category?.color ? 
                    category.color.split(' ')[0].replace('bg-[', '').replace(']', '') :
                    `hsl(${hue}, 70%, 50%)` 
                };
              } catch (error) {
                console.error('Error fetching category:', error);
                // Use a default color if the category fetch fails
                const hue = Math.abs((categoryId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
                categoryMap[categoryId] = { 
                  id: categoryId,
                  count: 0, 
                  color: `hsl(${hue}, 70%, 50%)`
                };
              }
            }
            categoryMap[categoryId].count += 1;
            totalExerciseCount += 1;
          }
        }

        console.log('Total exercise count:', totalExerciseCount);
        console.log('Categories found:', Object.keys(categoryMap).length);

        // Convert to array and calculate percentages
        const processedData: MuscleGroupData[] = [];
        
        for (const [id, { count, color }] of Object.entries(categoryMap)) {
          try {
            const category = await getCategoryById(id);
            if (category) {
              processedData.push({
                id,
                name: category.name,
                count,
                percentage: totalExerciseCount > 0 ? Math.round((count / totalExerciseCount) * 100) : 0,
                color
              });
            } else {
              // Use a generic name if the category is not found
              processedData.push({
                id,
                name: `Category ${id.substring(0, 6)}`,
                count,
                percentage: totalExerciseCount > 0 ? Math.round((count / totalExerciseCount) * 100) : 0,
                color
              });
            }
          } catch (error) {
            console.error('Error processing category:', error);
            // Add the category with a generic name on error
            processedData.push({
              id,
              name: `Category ${id.substring(0, 6)}`,
              count,
              percentage: totalExerciseCount > 0 ? Math.round((count / totalExerciseCount) * 100) : 0,
              color
            });
          }
        }

        // Sort by count descending
        processedData.sort((a, b) => b.count - a.count);
        console.log('Processed muscle group data:', processedData.length);
        
        // If no data was found, create demo data
        if (processedData.length === 0) {
          setMuscleGroupData(generateDemoMuscleGroupData());
        } else {
          setMuscleGroupData(processedData);
        }
      } catch (error) {
        console.error('Error processing muscle group data:', error);
        setError('Error processing workout data. Please try again later.');
        setMuscleGroupData(generateDemoMuscleGroupData());
      }
    };

    fetchCategoryData();
  }, [workouts, dateRange]);

  // Process the data for exercise progress
  useEffect(() => {
    if (!workouts.length) {
      console.log('No workouts to process for exercise progress');
      setExerciseData(generateDemoExerciseData());
      setIsLoading(false);
      return;
    }

    // Guard against invalid date ranges
    if (!dateRange || !dateRange.from || !dateRange.to) {
      console.log('Invalid date range for exercise progress, using demo data');
      setExerciseData(generateDemoExerciseData());
      setIsLoading(false);
      return;
    }

    try {
      const exerciseProgressItems: ExerciseProgressItem[] = [];

      // Get completed workouts within the date range
      const filteredWorkouts = workouts.filter(workout => {
        if (!workout.completed) return false;
        const workoutDate = parseISO(workout.date);
        return workoutDate >= dateRange.from && workoutDate <= dateRange.to;
      });
      
      console.log('Filtered workouts for exercise progress:', filteredWorkouts.length);

      // If no workouts in range, use demo data
      if (filteredWorkouts.length === 0) {
        console.log('No workouts in date range, using demo data');
        setExerciseData(generateDemoExerciseData());
        setIsLoading(false);
        return;
      }

      // Extract exercise data
      filteredWorkouts.forEach(workout => {
        const workoutDate = format(parseISO(workout.date), 'yyyy-MM-dd');
        
        workout.exercises.forEach(exercise => {
          // Get the max weight and reps for each completed set
          const completedSets = exercise.sets.filter(set => set.completed);
          
          if (completedSets.length > 0) {
            // Find the max weight set
            const maxWeightSet = completedSets.reduce((max, set) => 
              (set.weight || 0) > (max.weight || 0) ? set : max, completedSets[0]);
            
            exerciseProgressItems.push({
              date: workoutDate,
              exercise: exercise.exercise.name,
              weight: maxWeightSet.weight || 0,
              reps: maxWeightSet.actualReps || 0,
              category: exercise.exercise.category || ''
            });
          }
        });
      });

      // Sort by date
      exerciseProgressItems.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log('Exercise progress items:', exerciseProgressItems.length);
      
      // If no data was found, create demo data
      if (exerciseProgressItems.length === 0) {
        console.log('No exercise progress items found, using demo data');
        setExerciseData(generateDemoExerciseData());
      } else {
        setExerciseData(exerciseProgressItems);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing exercise data:', error);
      setError('Error processing exercise data. Please try again later.');
      setExerciseData(generateDemoExerciseData());
      setIsLoading(false);
    }
  }, [workouts, dateRange]);

  // Process the data for workout frequency
  useEffect(() => {
    if (!workouts.length) {
      console.log('No workouts to process for frequency data');
      setFrequencyData(generateDemoFrequencyData(view));
      return;
    }

    try {
      // Get interval data based on view selection
      let intervalData: { name: string; workouts: number; color: string }[] = [];
      
      // Filter workouts by date range first
      const filteredWorkouts = workouts.filter(workout => {
        if (!workout.completed) return false;
        const workoutDate = parseISO(workout.date);
        return workoutDate >= dateRange.from && workoutDate <= dateRange.to;
      });
      
      console.log('Filtered workouts for frequency data:', filteredWorkouts.length);
      
      // If no workouts in range, use demo data
      if (filteredWorkouts.length === 0) {
        setFrequencyData(generateDemoFrequencyData(view));
        return;
      }
      
      if (view === 'weekly') {
        // Create weekly intervals
        const weekIntervals = eachWeekOfInterval({
          start: dateRange.from,
          end: dateRange.to
        });
        
        console.log('Week intervals count:', weekIntervals.length);
        
        // Initialize weekly data
        intervalData = weekIntervals.map((weekStart, index) => {
          const weekNumber = getWeek(weekStart);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          return {
            name: `Week ${weekNumber} (${format(weekStart, 'MMM d')}-${format(weekEnd, 'MMM d')})`,
            workouts: 0,
            color: `hsl(${220 + index * 20}, 70%, 50%)`
          };
        });
        
        // Count workouts per week
        filteredWorkouts.forEach(workout => {
          const workoutDate = parseISO(workout.date);
          
          const weekIndex = weekIntervals.findIndex((weekStart, i) => {
            const nextWeekStart = weekIntervals[i + 1];
            return workoutDate >= weekStart && (!nextWeekStart || workoutDate < nextWeekStart);
          });
          
          if (weekIndex !== -1) {
            intervalData[weekIndex].workouts += 1;
          }
        });
      } else {
        // Monthly view
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Create a map of months in the range
        const monthsMap: Record<string, { name: string; workouts: number; color: string }> = {};
        
        // Create month intervals using each day (this ensures we don't miss months)
        const daysInRange = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to
        });
        
        daysInRange.forEach(day => {
          const monthKey = format(day, 'yyyy-MM');
          if (!monthsMap[monthKey]) {
            const monthIndex = getMonth(day);
            const year = format(day, 'yyyy');
            monthsMap[monthKey] = {
              name: `${monthNames[monthIndex]} ${year}`,
              workouts: 0,
              color: `hsl(${220 + monthIndex * 30}, 70%, 50%)`
            };
          }
        });
        
        // Count workouts per month
        filteredWorkouts.forEach(workout => {
          const workoutDate = parseISO(workout.date);
          const monthKey = format(workoutDate, 'yyyy-MM');
          
          if (monthsMap[monthKey]) {
            monthsMap[monthKey].workouts += 1;
          }
        });
        
        // Convert map to array and sort by date
        intervalData = Object.entries(monthsMap)
          .map(([key, value]) => value)
          .sort((a, b) => {
            const monthA = monthNames.findIndex(month => a.name.includes(month));
            const monthB = monthNames.findIndex(month => b.name.includes(month));
            
            const yearA = parseInt(a.name.split(' ')[1]);
            const yearB = parseInt(b.name.split(' ')[1]);
            
            if (yearA !== yearB) return yearA - yearB;
            return monthA - monthB;
          });
      }
      
      console.log('Frequency data intervals:', intervalData.length);
      
      // If no workouts were found in any interval, create demo data
      if (intervalData.length === 0 || intervalData.every(item => item.workouts === 0)) {
        setFrequencyData(generateDemoFrequencyData(view));
      } else {
        setFrequencyData(intervalData);
      }
    } catch (error) {
      console.error('Error processing frequency data:', error);
      setError('Error processing workout frequency data. Please try again later.');
      setFrequencyData(generateDemoFrequencyData(view));
    }
  }, [workouts, dateRange, view]);

  // Process data for upcoming analysis
  useEffect(() => {
    if (!workouts.length) {
      console.log('No workouts to process for upcoming analysis');
      setUpcomingWorkoutData(generateDemoUpcomingData());
      setIsLoading(false);
      return;
    }
    
    const now = new Date();
    console.log('Current date for upcoming analysis:', now);
    
    const fetchAnalysisData = async () => {
      try {
        const categoryMap: Record<string, { 
          id: string;
          name: string;
          pastCount: number; 
          futureCount: number; 
          color: string 
        }> = {};
        
        let pastTotal = 0;
        let futureTotal = 0;
        
        // Process past workouts
        const pastWorkouts = workouts.filter(workout => {
          if (!workout.completed) return false;
          const workoutDate = parseISO(workout.date);
          return workoutDate <= now && workoutDate >= dateRange.from;
        });
        
        console.log('Past workouts count:', pastWorkouts.length);
        
        // Process future scheduled workouts
        const futureWorkouts = workouts.filter(workout => {
          const workoutDate = parseISO(workout.date);
          return workoutDate > now;
        });
        
        console.log('Future workouts count:', futureWorkouts.length);
        
        // If no workouts in either category, use demo data
        if (pastWorkouts.length === 0 && futureWorkouts.length === 0) {
          setUpcomingWorkoutData(generateDemoUpcomingData());
          setIsLoading(false);
          return;
        }
        
        // Count past exercises by category
        for (const workout of pastWorkouts) {
          for (const exercise of workout.exercises) {
            const categoryId = exercise.exercise.category;
            if (!categoryId) continue;
            
            if (!categoryMap[categoryId]) {
              const category = await getCategoryById(categoryId);
              const hue = Math.abs((categoryId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
              
              categoryMap[categoryId] = { 
                id: categoryId,
                name: category?.name || 'Unknown',
                pastCount: 0, 
                futureCount: 0,
                color: category?.color ? 
                  category.color.split(' ')[0].replace('bg-[', '').replace(']', '') :
                  `hsl(${hue}, 70%, 50%)` 
              };
            }
            categoryMap[categoryId].pastCount += 1;
            pastTotal += 1;
          }
        }
        
        // Count future exercises by category
        for (const workout of futureWorkouts) {
          for (const exercise of workout.exercises) {
            const categoryId = exercise.exercise.category;
            if (!categoryId) continue;
            
            if (!categoryMap[categoryId]) {
              const category = await getCategoryById(categoryId);
              const hue = Math.abs((categoryId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
              
              categoryMap[categoryId] = { 
                id: categoryId,
                name: category?.name || 'Unknown',
                pastCount: 0, 
                futureCount: 0,
                color: category?.color ? 
                  category.color.split(' ')[0].replace('bg-[', '').replace(']', '') :
                  `hsl(${hue}, 70%, 50%)` 
              };
            }
            categoryMap[categoryId].futureCount += 1;
            futureTotal += 1;
          }
        }
        
        console.log('Past total exercises:', pastTotal);
        console.log('Future total exercises:', futureTotal);
        
        // Calculate percentages and determine suggestions
        const analysisData: CategoryAnalysis[] = [];
        
        for (const [id, { name, pastCount, futureCount, color }] of Object.entries(categoryMap)) {
          const pastPercentage = pastTotal > 0 ? (pastCount / pastTotal) * 100 : 0;
          const futurePercentage = futureTotal > 0 ? (futureCount / futureTotal) * 100 : 0;
          
          // Determine suggestions based on comparison
          let suggestion: 'increase' | 'decrease' | 'maintain';
          
          if (futurePercentage < pastPercentage * 0.8) {
            suggestion = 'increase'; // Future plan has significantly less of this category
          } else if (futurePercentage > pastPercentage * 1.2) {
            suggestion = 'decrease'; // Future plan has significantly more of this category
          } else {
            suggestion = 'maintain'; // Future plan has similar proportion of this category
          }
          
          analysisData.push({
            id,
            category: name,
            pastCount,
            futureCount,
            pastPercentage: Math.round(pastPercentage),
            futurePercentage: Math.round(futurePercentage),
            suggestion,
            color
          });
        }
        
        // Sort by past percentage (highest first)
        analysisData.sort((a, b) => b.pastPercentage - a.pastPercentage);
        
        console.log('Analysis data items:', analysisData.length);
        
        // If no data was found, create demo data
        if (analysisData.length === 0) {
          setUpcomingWorkoutData(generateDemoUpcomingData());
        } else {
          setUpcomingWorkoutData(analysisData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing analysis data:', error);
        setError('Error processing workout analysis data. Please try again later.');
        setUpcomingWorkoutData(generateDemoUpcomingData());
        setIsLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [workouts, dateRange]);

  // Helper function to generate demo muscle group data
  function generateDemoMuscleGroupData(): MuscleGroupData[] {
    return [
      { id: '1', name: 'Chest', count: 15, percentage: 25, color: '#0ea5e9' },
      { id: '2', name: 'Back', count: 12, percentage: 20, color: '#6366f1' },
      { id: '3', name: 'Legs', count: 12, percentage: 20, color: '#f97316' },
      { id: '4', name: 'Shoulders', count: 9, percentage: 15, color: '#8b5cf6' },
      { id: '5', name: 'Arms', count: 7, percentage: 12, color: '#ec4899' },
      { id: '6', name: 'Core', count: 5, percentage: 8, color: '#10b981' }
    ];
  }

  // Helper function to generate demo exercise data
  function generateDemoExerciseData(): ExerciseProgressItem[] {
    const today = new Date();
    const data: ExerciseProgressItem[] = [];
    
    // Generate more diverse exercise data
    const exercises = [
      { name: 'Bench Press', category: 'Chest', baseWeight: 80 },
      { name: 'Squat', category: 'Legs', baseWeight: 120 },
      { name: 'Deadlift', category: 'Back', baseWeight: 140 },
      { name: 'Overhead Press', category: 'Shoulders', baseWeight: 60 },
      { name: 'Bicep Curl', category: 'Arms', baseWeight: 20 },
      { name: 'Tricep Extension', category: 'Arms', baseWeight: 25 },
      { name: 'Lat Pulldown', category: 'Back', baseWeight: 70 },
      { name: 'Leg Press', category: 'Legs', baseWeight: 150 },
      { name: 'Lateral Raise', category: 'Shoulders', baseWeight: 15 },
      { name: 'Cable Fly', category: 'Chest', baseWeight: 35 },
      { name: 'Romanian Deadlift', category: 'Legs', baseWeight: 100 },
      { name: 'Face Pull', category: 'Shoulders', baseWeight: 40 },
      { name: 'Plank', category: 'Core', baseWeight: 0 },
      { name: 'Russian Twist', category: 'Core', baseWeight: 10 },
      { name: 'Seated Row', category: 'Back', baseWeight: 65 }
    ];
    
    // Generate data for past 20 days with different exercise frequencies
    for (let i = 20; i >= 0; i -= 2) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Add 3-5 exercises per workout day
      const exerciseCount = 3 + Math.floor(Math.random() * 3);
      const shuffledExercises = [...exercises].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < exerciseCount; j++) {
        const exercise = shuffledExercises[j];
        data.push({
          date: formattedDate,
          exercise: exercise.name,
          weight: exercise.baseWeight + Math.floor(Math.random() * 20),
          reps: 6 + Math.floor(Math.random() * 6),
          category: exercise.category
        });
      }
    }
    
    console.log('Generated demo exercise data:', data.length, 'items');
    return data;
  }

  // Helper function to generate demo frequency data
  function generateDemoFrequencyData(view: 'weekly' | 'monthly'): FrequencyData[] {
    if (view === 'weekly') {
      return [
        { name: 'Week 1', workouts: 3, color: 'hsl(220, 70%, 50%)' },
        { name: 'Week 2', workouts: 4, color: 'hsl(240, 70%, 50%)' },
        { name: 'Week 3', workouts: 2, color: 'hsl(260, 70%, 50%)' },
        { name: 'Week 4', workouts: 5, color: 'hsl(280, 70%, 50%)' },
        { name: 'Week 5', workouts: 3, color: 'hsl(300, 70%, 50%)' },
        { name: 'Week 6', workouts: 4, color: 'hsl(320, 70%, 50%)' }
      ];
    } else {
      return [
        { name: 'January 2023', workouts: 12, color: 'hsl(220, 70%, 50%)' },
        { name: 'February 2023', workouts: 14, color: 'hsl(250, 70%, 50%)' },
        { name: 'March 2023', workouts: 11, color: 'hsl(280, 70%, 50%)' },
        { name: 'April 2023', workouts: 15, color: 'hsl(310, 70%, 50%)' },
        { name: 'May 2023', workouts: 13, color: 'hsl(340, 70%, 50%)' }
      ];
    }
  }

  // Helper function to generate demo upcoming data
  function generateDemoUpcomingData(): CategoryAnalysis[] {
    return [
      {
        id: '1',
        category: 'Chest',
        pastCount: 15,
        futureCount: 12,
        pastPercentage: 25,
        futurePercentage: 20,
        suggestion: 'maintain',
        color: '#0ea5e9'
      },
      {
        id: '2',
        category: 'Back',
        pastCount: 12,
        futureCount: 15,
        pastPercentage: 20,
        futurePercentage: 25,
        suggestion: 'decrease',
        color: '#6366f1'
      },
      {
        id: '3',
        category: 'Legs',
        pastCount: 12,
        futureCount: 6,
        pastPercentage: 20,
        futurePercentage: 10,
        suggestion: 'increase',
        color: '#f97316'
      },
      {
        id: '4',
        category: 'Shoulders',
        pastCount: 9,
        futureCount: 9,
        pastPercentage: 15,
        futurePercentage: 15,
        suggestion: 'maintain',
        color: '#8b5cf6'
      },
      {
        id: '5',
        category: 'Arms',
        pastCount: 7,
        futureCount: 10,
        pastPercentage: 12,
        futurePercentage: 17,
        suggestion: 'decrease',
        color: '#ec4899'
      },
      {
        id: '6',
        category: 'Core',
        pastCount: 5,
        futureCount: 8,
        pastPercentage: 8,
        futurePercentage: 13,
        suggestion: 'maintain',
        color: '#10b981'
      }
    ];
  }

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  };
};
