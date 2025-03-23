
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface MetricsTimeFilterProps {
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
  timeFilter: 'week' | 'month' | 'custom';
  setTimeFilter: React.Dispatch<React.SetStateAction<'week' | 'month' | 'custom'>>;
  view: 'weekly' | 'monthly';
  setView: React.Dispatch<React.SetStateAction<'weekly' | 'monthly'>>;
  handleDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
}

const MetricsTimeFilter: React.FC<MetricsTimeFilterProps> = ({
  dateRange,
  timeFilter,
  setTimeFilter,
  handleDateRangeChange
}) => {
  // Helper to validate date
  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Handle calendar selection changes
  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    console.log('Calendar selection changed:', range);
    
    if (!range) {
      console.warn('Calendar selection is undefined');
      return;
    }
    
    // Validate the dates
    if (range.from && !isValidDate(range.from)) {
      console.error('Invalid from date:', range.from);
      toast.error("Invalid start date selected");
      return;
    }
    
    if (range.to && !isValidDate(range.to)) {
      console.error('Invalid to date:', range.to);
      toast.error("Invalid end date selected");
      return;
    }
    
    // Pass to parent handler
    handleDateRangeChange(range);
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Time Period:</span>
        <Select 
          value={timeFilter} 
          onValueChange={(value) => {
            console.log('Time filter changed to:', value);
            setTimeFilter(value as 'week' | 'month' | 'custom');
          }}
        >
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
                This affects all charts and analyses. For today's workouts, select the same date for both start and end.
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
              {isValidDate(dateRange?.from) && isValidDate(dateRange?.to) ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
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
              selected={{ 
                from: dateRange?.from, 
                to: dateRange?.to 
              }}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MetricsTimeFilter;
