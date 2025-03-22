
import React from 'react';
import { Dumbbell, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-purple-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No exercise data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete more workouts to track your exercise progress over time
    </p>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);
