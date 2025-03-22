
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  InfoIcon, 
  BarChart3, 
  Dumbbell, 
  LineChart, 
  Clock,
  ChevronDown 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  format, 
  subDays, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isAfter,
  addDays,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import MuscleGroupsChart from '@/components/metrics/MuscleGroupsChart';
import ExerciseProgressChart from '@/components/metrics/ExerciseProgressChart';
import WorkoutFrequencyChart from '@/components/metrics/WorkoutFrequencyChart';
import UpcomingAnalysis from '@/components/metrics/UpcomingAnalysis';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WorkoutMetrics = () => {
  // Create default date range using today as the end date
  const today = new Date();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfWeek(today),
    to: today,
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'custom'>('week');
  
  // Update date range when time filter changes
  useEffect(() => {
    if (timeFilter === 'week') {
      setDateRange({
        from: startOfWeek(today),
        to: today
      });
    } else if (timeFilter === 'month') {
      setDateRange({
        from: startOfMonth(subMonths(today, 1)),
        to: today
      });
    }
    // 'custom' doesn't automatically change the date range, allowing user selection
  }, [timeFilter]);
  
  const { 
    muscleGroupData, 
    exerciseData, 
    frequencyData,
    upcomingWorkoutData,
    isLoading
  } = useMetricsData(dateRange, view);

  // Ensure from date is before to date
  const handleDateRangeChange = (range: { from: Date; to?: Date }) => {
    if (range.from && range.to && isAfter(range.from, range.to)) {
      // If from date is after to date, set to date to from date
      setDateRange({ from: range.from, to: range.from });
    } else if (range.from && !range.to) {
      setDateRange({ from: range.from, to: range.from });
    } else if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      setTimeFilter('custom'); // Switch to custom when manually selecting dates
    }
  };

  return (
    <PageContainer>
      <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          Workout Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and analyze your workout patterns
        </p>
        
        <div className="mt-4 mx-auto max-w-xl p-3 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-left text-slate-700">
              This dashboard helps you analyze your workout patterns and progress.
              Select a time period below to view specific metrics for muscle groups, exercises, and workout frequency.
            </p>
          </div>
        </div>
      </div>

      {/* Time Period Filter Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Time Period:</span>
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'week' | 'month' | 'custom')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help mr-2" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Date Range Selection</h4>
                <p className="text-sm">
                  Quick select a time period or choose a custom date range to analyze your workouts.
                  This affects all charts and analyses.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  "border-dashed border-blue-200",
                  timeFilter !== 'custom' && "opacity-70"
                )}
                disabled={timeFilter !== 'custom'}
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
                onSelect={handleDateRangeChange as any}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Tabs
          defaultValue="weekly"
          className="w-full max-w-[220px]"
          onValueChange={(v) => setView(v as 'weekly' | 'monthly')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="muscle-groups" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="muscle-groups" className="flex items-center justify-center">
            <Dumbbell className="w-4 h-4 mr-2" />
            Muscle Groups
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center justify-center">
            <LineChart className="w-4 h-4 mr-2" />
            Exercises
          </TabsTrigger>
          <TabsTrigger value="frequency" className="flex items-center justify-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Workout Frequency
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="muscle-groups" className="mt-6">
          <MuscleGroupsChart 
            data={muscleGroupData} 
            isLoading={isLoading}
            dateRange={dateRange}
            timeFilter={timeFilter}
          />
        </TabsContent>
        
        <TabsContent value="exercises" className="mt-6">
          <ExerciseProgressChart 
            data={exerciseData} 
            isLoading={isLoading}
            dateRange={dateRange}
            timeFilter={timeFilter}
          />
        </TabsContent>
        
        <TabsContent value="frequency" className="mt-6">
          <WorkoutFrequencyChart 
            data={frequencyData} 
            isLoading={isLoading} 
            view={view}
            dateRange={dateRange}
            timeFilter={timeFilter}
          />
        </TabsContent>
      </Tabs>
      
      {/* Upcoming Analysis Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">Future Workout Analysis</h2>
        <UpcomingAnalysis data={upcomingWorkoutData} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
};

export default WorkoutMetrics;
