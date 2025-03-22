
import React from 'react';
import { format } from "date-fns";
import { TrendingUp, InfoIcon } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface HeaderSectionProps {
  view: 'weekly' | 'monthly';
  timeFilter: 'week' | 'month' | 'custom';
  dateRange: { from: Date; to: Date };
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ view, timeFilter, dateRange }) => {
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="flex items-center text-lg font-bold text-gray-800">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
          Workout Consistency
        </CardTitle>
        <CardDescription className="mt-1 text-gray-500">
          {timeFilter === 'week' ? 'Last Week' : 
           timeFilter === 'month' ? 'Last Month' : dateRangeText}
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {view} view
        </Badge>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
              <InfoIcon className="h-4 w-4" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <h4 className="text-sm font-semibold">About This Chart</h4>
            <p className="text-sm text-gray-600 mt-1">
              This chart shows your workout frequency over time. The dotted line represents your average.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default HeaderSection;
