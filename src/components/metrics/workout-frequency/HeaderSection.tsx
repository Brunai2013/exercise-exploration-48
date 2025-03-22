
import React from 'react';
import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface HeaderSectionProps {
  view: 'weekly' | 'monthly';
  timeFilter: 'week' | 'month' | 'custom';
  dateRange: { from: Date; to: Date };
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ view, timeFilter, dateRange }) => {
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  return (
    <CardHeader className="pb-0">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl font-bold">Workout Consistency</CardTitle>
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
                This chart shows your workout frequency over time. The bars represent the number of workouts 
                completed each {view === 'weekly' ? 'week' : 'month'}. The dotted line shows your average workout frequency.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </CardHeader>
  );
};

export default HeaderSection;
