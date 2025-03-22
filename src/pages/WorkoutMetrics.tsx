
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter } from 'date-fns';
import { startOfWeek, startOfMonth, subMonths, subYears, format } from 'date-fns';
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
    from: subYears(today, 1), // Changed to go back 1 year for more data
    to: today,
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'custom'>('custom'); // Changed to 'custom' to use our 1 year range
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force data reload
  
  // Update date range when time filter changes
  useEffect(() => {
    console.log('Time filter changed to:', timeFilter);
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
    } else if (timeFilter === 'custom' && dateRange.from === dateRange.to) {
      // If custom is selected but dates are the same, set a reasonable default range
      setDateRange({
        from: subYears(today, 1),
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
      from: format(dateRange.from, 'yyyy-MM-dd'),
      to: format(dateRange.to, 'yyyy-MM-dd')
    });
    console.log('Metrics data loaded:', {
      muscleGroups: muscleGroupData.length,
      exercises: exerciseData.length,
      frequency: frequencyData.length,
      upcoming: upcomingWorkoutData.length,
      loading: isLoading
    });
  }, [dateRange, muscleGroupData, exerciseData, frequencyData, upcomingWorkoutData, isLoading]);

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
    console.log('Date range changed to:', range);
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
