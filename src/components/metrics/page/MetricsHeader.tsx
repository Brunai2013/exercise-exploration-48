
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

const MetricsHeader: React.FC = () => {
  return (
    <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100 animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        Workout Analytics
      </h1>
      <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
        Track your progress and analyze your workout patterns
        <Popover>
          <PopoverTrigger>
            <InfoIcon className="h-5 w-5 text-blue-500 cursor-help" />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About Workout Analytics</h4>
              <p className="text-sm text-slate-700">
                This dashboard helps you analyze your workout patterns and progress.
                Select a time period below to view specific metrics for muscle groups, exercises, and workout frequency.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </p>
    </div>
  );
};

export default MetricsHeader;
