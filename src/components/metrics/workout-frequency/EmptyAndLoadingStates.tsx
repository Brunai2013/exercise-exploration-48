
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-blue-50 p-3 mb-4">
      <Calendar className="h-6 w-6 text-blue-500" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No workout data available</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete more workouts to track your training consistency
    </p>
  </div>
);

export const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

export const EmptyStateCard = ({ view, timeFilter, dateRange }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>Workout Consistency</CardTitle>
          <CardDescription>
            Track how often you're working out
          </CardDescription>
        </div>
        <Badge variant="outline" className="ml-2 capitalize">
          {view} view
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <EmptyState />
    </CardContent>
  </Card>
);
