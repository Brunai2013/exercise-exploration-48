
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const FutureExerciseChartHeader: React.FC = () => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>Upcoming Exercise Distribution</CardTitle>
          <CardDescription>
            See which exercises you'll be doing most in your scheduled workouts
          </CardDescription>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About This Chart</h4>
              <p className="text-sm">
                This breakdown shows the distribution of exercises in your upcoming scheduled workouts.
                The percentages indicate how frequently you'll be doing each exercise.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </CardHeader>
  );
};

export default FutureExerciseChartHeader;
