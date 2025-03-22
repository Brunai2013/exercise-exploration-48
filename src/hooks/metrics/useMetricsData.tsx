
import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, getWeek, getMonth } from 'date-fns';
import { getAllWorkouts } from '@/lib/workouts';
import { getCategoryById } from '@/lib/categories';
import { Workout } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

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
  view: 'weekly' | 'monthly'
) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([]);
  const [exerciseData, setExerciseData] = useState<ExerciseProgressItem[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [upcomingWorkoutData, setUpcomingWorkoutData] = useState<CategoryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        const allWorkouts = await getAllWorkouts();
        setWorkouts(allWorkouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast({
          title: "Error",
          description: "Failed to load workout data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // Process the data for muscle groups
  useEffect(() => {
    if (!workouts.length) return;

    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        const categoryMap: Record<string, { id: string; count: number; color: string }> = {};
        let totalExerciseCount = 0;

        // Get completed workouts within the date range
        const filteredWorkouts = workouts.filter(workout => {
          if (!workout.completed) return false;
          const workoutDate = parseISO(workout.date);
          return workoutDate >= dateRange.from && workoutDate <= dateRange.to;
        });

        // Count exercises by category
        for (const workout of filteredWorkouts) {
          for (const exercise of workout.exercises) {
            // Only count exercises with completed sets
            const completedSets = exercise.sets.filter(set => set.completed).length;
            if (completedSets === 0) continue;

            const categoryId = exercise.exercise.category;
            if (!categoryId) continue;

            if (!categoryMap[categoryId]) {
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
            }
            categoryMap[categoryId].count += 1;
            totalExerciseCount += 1;
          }
        }

        // Convert to array and calculate percentages
        const processedData: MuscleGroupData[] = [];
        
        for (const [id, { count, color }] of Object.entries(categoryMap)) {
          const category = await getCategoryById(id);
          if (category) {
            processedData.push({
              id,
              name: category.name,
              count,
              percentage: totalExerciseCount > 0 ? Math.round((count / totalExerciseCount) * 100) : 0,
              color
            });
          }
        }

        // Sort by count descending
        processedData.sort((a, b) => b.count - a.count);
        setMuscleGroupData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing muscle group data:', error);
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [workouts, dateRange]);

  // Process the data for exercise progress
  useEffect(() => {
    if (!workouts.length) return;

    const exerciseProgressItems: ExerciseProgressItem[] = [];

    // Get completed workouts within the date range
    const filteredWorkouts = workouts.filter(workout => {
      if (!workout.completed) return false;
      const workoutDate = parseISO(workout.date);
      return workoutDate >= dateRange.from && workoutDate <= dateRange.to;
    });

    // Extract exercise data
    filteredWorkouts.forEach(workout => {
      const workoutDate = format(parseISO(workout.date), 'yyyy-MM-dd');
      
      workout.exercises.forEach(exercise => {
        // Get the max weight and reps for each completed set
        const completedSets = exercise.sets.filter(set => set.completed);
        
        if (completedSets.length > 0) {
          // Find the max weight set
          const maxWeightSet = completedSets.reduce((max, set) => 
            (set.weight > max.weight) ? set : max, completedSets[0]);
          
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

    setExerciseData(exerciseProgressItems);
  }, [workouts, dateRange]);

  // Process the data for workout frequency
  useEffect(() => {
    if (!workouts.length) return;

    // Get interval data based on view selection
    let intervalData: { name: string; workouts: number; color: string }[] = [];
    
    if (view === 'weekly') {
      // Create weekly intervals
      const weekIntervals = eachWeekOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
      
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
      workouts.forEach(workout => {
        if (!workout.completed) return;
        
        const workoutDate = parseISO(workout.date);
        if (workoutDate < dateRange.from || workoutDate > dateRange.to) return;
        
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
      workouts.forEach(workout => {
        if (!workout.completed) return;
        
        const workoutDate = parseISO(workout.date);
        if (workoutDate < dateRange.from || workoutDate > dateRange.to) return;
        
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
    
    setFrequencyData(intervalData);
  }, [workouts, dateRange, view]);

  // Process data for upcoming analysis
  useEffect(() => {
    if (!workouts.length) return;
    
    const now = new Date();
    
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
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
        
        // Process future scheduled workouts
        const futureWorkouts = workouts.filter(workout => {
          const workoutDate = parseISO(workout.date);
          return workoutDate > now;
        });
        
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
        
        setUpcomingWorkoutData(analysisData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing analysis data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [workouts, dateRange]);

  return {
    muscleGroupData,
    exerciseData,
    frequencyData,
    upcomingWorkoutData,
    isLoading
  };
};
