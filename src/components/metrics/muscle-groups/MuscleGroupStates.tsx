
import { Dumbbell, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { format } from "date-fns";

// Loading state when data is being fetched
export const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
    <div className="flex flex-wrap gap-2 mt-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Empty state when no data is available
export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No workout data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete workouts to see which muscle groups you're focusing on
    </p>
  </div>
);

// Card header with title, description and tooltip
export const ChartHeader = ({ 
  dateRange, 
  timeFilter 
}: { 
  dateRange: { from: Date; to: Date }; 
  timeFilter: 'week' | 'month' | 'custom' 
}) => {
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  
  return (
    <CardHeader className="pb-0">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl font-bold">Muscle Groups Worked</CardTitle>
          <CardDescription className="mt-1 text-base">
            {timeFilter === 'week' ? 'Last Week' : 
             timeFilter === 'month' ? 'Last Month' : dateRangeText}
          </CardDescription>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">How to Use This Chart</h4>
              <p className="text-sm">
                This chart shows how your workout exercises are distributed across different muscle groups.
                The labels show the percentage of your total exercises dedicated to each muscle group.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </CardHeader>
  );
};

// Empty state wrapped in a card
export const EmptyStateCard = ({ 
  dateRange, 
  timeFilter 
}: { 
  dateRange: { from: Date; to: Date }; 
  timeFilter: 'week' | 'month' | 'custom'
}) => (
  <Card>
    <ChartHeader dateRange={dateRange} timeFilter={timeFilter} />
    <CardContent>
      <EmptyState />
    </CardContent>
  </Card>
);
