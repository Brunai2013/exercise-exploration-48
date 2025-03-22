
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter } from 'date-fns';
import { startOfWeek, startOfMonth, subMonths } from 'date-fns';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import MetricsHeader from '@/components/metrics/page/MetricsHeader';
import MetricsTimeFilter from '@/components/metrics/page/MetricsTimeFilter';
import MetricsTabs from '@/components/metrics/page/MetricsTabs';

const WorkoutMetrics = () => {
  // Create default date range using today as the end date
  const today = new Date();
  console.log('Metrics page initialized with today date:', today);
  
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
    }
    // 'custom' doesn't automatically change the date range, allowing user selection
  }, [timeFilter, today]);
  
  const { 
    muscleGroupData, 
    exerciseData, 
    frequencyData,
    upcomingWorkoutData,
    isLoading
  } = useMetricsData(dateRange, view);

  console.log('Metrics data loaded:', {
    muscleGroups: muscleGroupData.length,
    exercises: exerciseData.length,
    frequency: frequencyData.length,
    upcoming: upcomingWorkoutData.length,
    loading: isLoading
  });

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

  return (
    <PageContainer>
      {/* Header Section */}
      <MetricsHeader />

      {/* Time Period Filter Section */}
      <MetricsTimeFilter 
        dateRange={dateRange}
        setDateRange={setDateRange}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        view={view}
        setView={setView}
        handleDateRangeChange={handleDateRangeChange}
      />

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
