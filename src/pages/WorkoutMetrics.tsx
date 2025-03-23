
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subYears, format } from 'date-fns';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import MetricsHeader from '@/components/metrics/page/MetricsHeader';
import MetricsTimeFilter from '@/components/metrics/page/MetricsTimeFilter';
import MetricsTabs from '@/components/metrics/page/MetricsTabs';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const WorkoutMetrics = () => {
  // Create default date range with a wider range - going back 6 months instead of 1
  const today = new Date();
  console.log('Metrics page initialized with today date:', today);
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(today, 7), // Default to last week
    to: today,
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'custom'>('week'); // Changed default to 'week'
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force data reload
  
  // Update date range when time filter changes
  useEffect(() => {
    console.log('Time filter changed to:', timeFilter);
    if (timeFilter === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      setDateRange({
        from: weekStart,
        to: today
      });
    } else if (timeFilter === 'month') {
      const monthStart = startOfMonth(new Date()); // Current month start
      setDateRange({
        from: monthStart,
        to: today
      });
    } else if (timeFilter === 'custom' && (!dateRange.from || !dateRange.to)) {
      // If custom is selected but dates are invalid, set a reasonable default range
      setDateRange({
        from: subDays(today, 30),
        to: today
      });
    }
    // 'custom' doesn't automatically change the date range, allowing user selection
  }, [timeFilter, today]);
  
  const { 
    muscleGroupData, 
    exerciseData, 
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  } = useMetricsData(dateRange, view, refreshKey);

  // Show toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading metrics data",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  // Debug logs to help diagnose the issue
  useEffect(() => {
    console.log('Current date range:', {
      from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'undefined',
      to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'undefined'
    });
    console.log('Metrics data loaded:', {
      muscleGroups: muscleGroupData?.length || 0,
      exercises: exerciseData?.length || 0,
      frequency: frequencyData?.length || 0,
      upcoming: upcomingWorkoutData?.length || 0,
      loading: isLoading
    });
  }, [dateRange, muscleGroupData, exerciseData, frequencyData, upcomingWorkoutData, isLoading]);

  // Ensure from date is before to date
  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    // Handle undefined values
    const newFrom = range.from || dateRange.from;
    const newTo = range.to || (range.from || dateRange.from);
    
    // If from date is after to date, adjust accordingly
    if (isAfter(newFrom, newTo)) {
      setDateRange({ from: newFrom, to: newFrom });
    } else {
      setDateRange({ from: newFrom, to: newTo });
    }
    
    setTimeFilter('custom'); // Switch to custom when manually selecting dates
    console.log('Date range changed to:', { from: newFrom, to: newTo });
  };

  // Add a manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Refreshing data",
      description: "Loading the latest workout metrics...",
    });
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <MetricsHeader />

      {/* Time Period Filter Section */}
      <div className="flex flex-col space-y-4">
        <MetricsTimeFilter 
          dateRange={dateRange}
          setDateRange={setDateRange}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          view={view}
          setView={setView}
          handleDateRangeChange={handleDateRangeChange}
        />
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Content Tabs with integrated future analysis sections */}
      <MetricsTabs 
        muscleGroupData={muscleGroupData}
        exerciseData={exerciseData}
        frequencyData={frequencyData}
        upcomingWorkoutData={upcomingWorkoutData}
        isLoading={isLoading}
        view={view}
        dateRange={dateRange}
        timeFilter={timeFilter}
      />
    </PageContainer>
  );
};

export default WorkoutMetrics;
