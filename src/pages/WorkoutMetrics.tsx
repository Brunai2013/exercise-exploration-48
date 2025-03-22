
import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import MuscleGroupsChart from '@/components/metrics/MuscleGroupsChart';
import ExerciseProgressChart from '@/components/metrics/ExerciseProgressChart';
import WorkoutFrequencyChart from '@/components/metrics/WorkoutFrequencyChart';
import UpcomingAnalysis from '@/components/metrics/UpcomingAnalysis';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';

const WorkoutMetrics = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date()),
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  
  const { 
    muscleGroupData, 
    exerciseData, 
    frequencyData,
    upcomingWorkoutData,
    isLoading
  } = useMetricsData(dateRange, view);

  return (
    <PageContainer>
      <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          Workout Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and analyze your workout patterns
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Tabs
          defaultValue="weekly"
          className="w-full max-w-md"
          onValueChange={(v) => setView(v as 'weekly' | 'monthly')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
        </Tabs>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                "border-dashed border-blue-200"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange as any}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="muscle-groups" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="muscle-groups" className="mt-6">
          <MuscleGroupsChart data={muscleGroupData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="exercises" className="mt-6">
          <ExerciseProgressChart data={exerciseData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="frequency" className="mt-6">
          <WorkoutFrequencyChart data={frequencyData} isLoading={isLoading} view={view} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <UpcomingAnalysis data={upcomingWorkoutData} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default WorkoutMetrics;
