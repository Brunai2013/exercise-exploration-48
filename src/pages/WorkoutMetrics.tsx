
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter, subDays, format } from 'date-fns';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import MetricsHeader from '@/components/metrics/page/MetricsHeader';
import MetricsTimeFilter from '@/components/metrics/page/MetricsTimeFilter';
import MetricsTabs from '@/components/metrics/page/MetricsTabs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const WorkoutMetrics = () => {
  // Create default date range - today only for more accurate data display
  const today = new Date();
  // Format today for consistent display
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${year}-${month}-${day}`;
  
  console.log('Metrics page initialized with today\'s date:', todayFormatted);
  
  // Get a date 7 days ago for default "week" view
  const weekAgo = subDays(new Date(), 7);
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: weekAgo, // Last week as default start date
    to: today,     // Today as default end date
  });
  
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'custom'>('week'); // Default to 'week'
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDemoData, setShowDemoData] = useState(true); // Default to ON for better UX
  
  // Define future days window (7 days)
  const futureDays = 7;
  
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
  }, [timeFilter]);
  
  const { 
    muscleGroupData, 
    exerciseData, 
    frequencyData,
    upcomingWorkoutData,
    isLoading,
    error
  } = useMetricsData(dateRange, view, refreshKey, !showDemoData, futureDays);

  // Show toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(`Error loading metrics data: ${error}`);
      console.error('Metrics data error:', error);
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
      loading: isLoading,
      showDemoData
    });
  }, [dateRange, muscleGroupData, exerciseData, frequencyData, upcomingWorkoutData, isLoading, showDemoData]);

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

  // Toggle demo data
  const handleToggleDemoData = () => {
    setShowDemoData(prev => !prev);
    toast.info(showDemoData 
      ? "Demo data disabled. You'll only see real workout data." 
      : "Demo data enabled. You'll see example data when no workouts exist.");
    setRefreshKey(prev => prev + 1); // Force refresh data
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
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch 
              id="demo-mode"
              checked={showDemoData}
              onCheckedChange={handleToggleDemoData}
            />
            <label 
              htmlFor="demo-mode" 
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <Database className="h-3.5 w-3.5" />
              Show Demo Data
            </label>
          </div>
          
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
        futureDays={futureDays}
      />
    </PageContainer>
  );
};

export default WorkoutMetrics;
