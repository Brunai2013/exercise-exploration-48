
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Minus, PieChart, XCircle, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface UpcomingAnalysisProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-orange-100 p-3 mb-4">
      <PieChart className="h-6 w-6 text-orange-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No data for analysis</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Schedule future workouts to see how they compare with your past training
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-12 w-full mb-2" />
    <Skeleton className="h-12 w-full mb-2" />
    <Skeleton className="h-12 w-full mb-2" />
    <Skeleton className="h-12 w-full" />
  </div>
);

// Helper function to get suggestion component
const getSuggestionIcon = (suggestion: 'increase' | 'decrease' | 'maintain') => {
  switch (suggestion) {
    case 'increase':
      return (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <ArrowUp className="h-4 w-4 mr-1" />
          Increase
        </div>
      );
    case 'decrease':
      return (
        <div className="flex items-center text-red-600 text-sm font-medium">
          <ArrowDown className="h-4 w-4 mr-1" />
          Decrease
        </div>
      );
    default:
      return (
        <div className="flex items-center text-blue-600 text-sm font-medium">
          <Minus className="h-4 w-4 mr-1" />
          Maintain
        </div>
      );
  }
};

const UpcomingAnalysis: React.FC<UpcomingAnalysisProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Workout Analysis</CardTitle>
              <CardDescription>
                Compare your upcoming workouts with your past training
              </CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About This Analysis</h4>
                  <p className="text-sm">
                    This analysis compares your upcoming workouts with your past training patterns.
                    It helps identify if any muscle groups are being over or under-trained in your future plans.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  // Has both past and future workouts?
  const hasPastWorkouts = data.some(item => item.pastCount > 0);
  const hasFutureWorkouts = data.some(item => item.futureCount > 0);
  
  if (!hasPastWorkouts || !hasFutureWorkouts) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upcoming Workout Analysis</CardTitle>
              <CardDescription>
                {!hasPastWorkouts 
                  ? "Complete some workouts first to enable analysis" 
                  : "Schedule future workouts to compare with your past training"}
              </CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">How to Use This Analysis</h4>
                  <p className="text-sm">
                    {!hasPastWorkouts 
                      ? "You need completed workouts in your history to use this feature." 
                      : "Schedule future workouts to see how they compare with your past training patterns."}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <XCircle className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {!hasPastWorkouts 
                ? "No past workouts data" 
                : "No upcoming workouts scheduled"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {!hasPastWorkouts 
                ? "Complete some workouts to see analysis of your training patterns" 
                : "Schedule future workouts to see how they compare with your past training"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upcoming Workout Analysis</CardTitle>
            <CardDescription>
              Compare your upcoming workouts with your past training
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How to Use This Analysis</h4>
                <p className="text-sm">
                  This tool compares your upcoming scheduled workouts with your past training patterns.
                  <ul className="list-disc pl-5 mt-1">
                    <li><span className="text-green-600">Increase</span>: Add more of these exercises</li>
                    <li><span className="text-red-600">Decrease</span>: Reduce focus on these muscle groups</li>
                    <li><span className="text-blue-600">Maintain</span>: Good balance between past and future</li>
                  </ul>
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-start mb-2">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <h3 className="font-medium">{item.category}</h3>
                </div>
                {getSuggestionIcon(item.suggestion)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Past Training</p>
                  <Progress 
                    value={item.pastPercentage} 
                    className="h-2 mb-1"
                    style={{ 
                      backgroundColor: `${item.color}20`,
                      "--progress-foreground": item.color
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs">
                    <span>{item.pastCount} exercises</span>
                    <span>{item.pastPercentage}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Upcoming Plans</p>
                  <Progress 
                    value={item.futurePercentage}
                    className="h-2 mb-1"
                    style={{ 
                      backgroundColor: `${item.color}20`,
                      "--progress-foreground": item.color
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs">
                    <span>{item.futureCount} exercises</span>
                    <span>{item.futurePercentage}%</span>
                  </div>
                </div>
              </div>
              
              <p className="mt-3 text-sm text-muted-foreground">
                {item.suggestion === 'increase' && 
                  "Consider adding more of these exercises to your upcoming workouts to maintain balance."}
                {item.suggestion === 'decrease' && 
                  "Your upcoming workouts may have too much focus on this muscle group compared to your past training."}
                {item.suggestion === 'maintain' && 
                  "Your upcoming workouts maintain a good balance with your past training for this muscle group."}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAnalysis;
