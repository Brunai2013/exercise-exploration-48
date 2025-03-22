
import React from 'react';
import { InfoIcon } from 'lucide-react';

const MetricsHeader: React.FC = () => {
  return (
    <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100 animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        Workout Analytics
      </h1>
      <p className="text-muted-foreground mt-2">
        Track your progress and analyze your workout patterns
      </p>
      
      <div className="mt-4 mx-auto max-w-xl p-3 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
        <div className="flex items-start">
          <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-left text-slate-700">
            This dashboard helps you analyze your workout patterns and progress.
            Select a time period below to view specific metrics for muscle groups, exercises, and workout frequency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsHeader;
