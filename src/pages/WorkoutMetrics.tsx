
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { isAfter } from 'date-fns';
import { startOfWeek, startOfMonth, subMonths } from 'date-fns';
import { useMetricsData } from '@/hooks/metrics/useMetricsData';
import MetricsHeader from '@/components/metrics/page/MetricsHeader';
import MetricsTimeFilter from '@/components/metrics/page/MetricsTimeFilter';
import MetricsTabs from '@/components/metrics/page/MetricsTabs';
import FutureAnalysisSection from '@/components/metrics/page/FutureAnalysisSection';

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

      {/* Main Content Tabs */}
      <MetricsTabs 
        muscleGroupData={muscleGroupData}
        exerciseData={exerciseData}
        frequencyData={frequencyData}
        isLoading={isLoading}
        view={view}
        dateRange={dateRange}
        timeFilter={timeFilter}
      />
      
      {/* Upcoming Analysis Section */}
      <FutureAnalysisSection 
        data={upcomingWorkoutData} 
        isLoading={isLoading} 
      />
    </PageContainer>
  );
};

export default WorkoutMetrics;
