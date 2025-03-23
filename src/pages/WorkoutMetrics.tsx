import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subYears, format } from 'date-fns';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import MetricsHeader from '@/components/metrics/page/MetricsHeader';
import MetricsTimeFilter from '@/components/metrics/page/MetricsTimeFilter';
import MetricsTabs from '@/components/metrics/page/MetricsTabs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const WorkoutMetrics = () => {
  // Create default date range - one week ago to today
  const today = new Date();
  const oneWeekAgo = subDays(today, 7);
  
  console.log('Metrics page initialized with date range:', {
    from: format(oneWeekAgo, 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd')
  });
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: oneWeekAgo,
    to: today,
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'custom'>('week');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Update date range when time filter changes
  useEffect(() => {
    console.log('Time filter changed to:', timeFilter);
    
    if (timeFilter === 'week') {
      // Last week (last 7 days)
      const weekAgo = subDays(new Date(), 7);
      console.log('Setting date range to last week:', {
        from: format(weekAgo, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd')
      });
      
      setDateRange({
        from: weekAgo,
        to: today
      });
    } else if (timeFilter === 'month') {
      // Last month (last 30 days)
      const monthAgo = subDays(new Date(), 30);
      console.log('Setting date range to last month:', {
        from: format(monthAgo, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd')
      });
      
      setDateRange({
        from: monthAgo,
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
      toast.error(`Error loading metrics data: ${error}`);
    }
  }, [error]);

  // Debug logs to help diagnose issues
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
    if (!range) {
      console.warn('Date range change received undefined range');
      return;
    }
    
    // Handle undefined values - keep existing values if one is missing
    const newFrom = range.from || dateRange.from;
    const newTo = range.to || range.from || dateRange.to;
    
    console.log('Handling date range change:', {
      from: newFrom ? format(newFrom, 'yyyy-MM-dd') : 'undefined',
      to: newTo ? format(newTo, 'yyyy-MM-dd') : 'undefined'
    });
    
    // If from date is after to date, adjust accordingly
    if (isAfter(newFrom, newTo)) {
      console.warn('From date is after to date, adjusting');
      setDateRange({ from: newFrom, to: newFrom });
    } else {
      setDateRange({ from: newFrom, to: newTo });
    }
    
    setTimeFilter('custom'); // Switch to custom when manually selecting dates
  };

  // Add a manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Refreshing workout metrics data...");
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
