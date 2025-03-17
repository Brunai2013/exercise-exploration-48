
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import SelectedDatePanel from '@/components/calendar/SelectedDatePanel';
import { useCalendarData } from '@/hooks/calendar/useCalendarData';

const Calendar = () => {
  const {
    currentMonth,
    selectedDate,
    selectedDateString,
    selectedWorkouts,
    calendarWorkouts,
    loading,
    setSelectedDate,
    nextMonth,
    prevMonth,
    refreshData
  } = useCalendarData();

  return (
    <PageContainer>
      <PageHeader 
        title="Calendar" 
        description="Schedule and manage your workout sessions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CalendarHeader 
            currentMonth={currentMonth}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
          />

          <CalendarGrid 
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            calendarWorkouts={calendarWorkouts}
            onSelectDate={setSelectedDate}
          />
        </div>
        
        <div>
          <SelectedDatePanel
            selectedDate={selectedDate}
            selectedWorkouts={selectedWorkouts}
            loading={loading}
            onArchive={refreshData}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Calendar;
