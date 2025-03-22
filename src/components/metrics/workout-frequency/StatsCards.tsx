
import React from 'react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalWorkouts: number;
  mostActivePeriod: {
    name: string;
    workouts: number;
  };
  avgWorkoutsPerPeriod: number;
  view: 'weekly' | 'monthly';
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  totalWorkouts, 
  mostActivePeriod, 
  avgWorkoutsPerPeriod,
  view
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
        <div className="rounded-full p-3 bg-blue-100 flex-shrink-0">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Workouts</p>
          <p className="text-2xl font-bold text-gray-800">{totalWorkouts}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
        <div className="rounded-full p-3 bg-indigo-100 flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Peak Activity</p>
          <p className="text-2xl font-bold text-gray-800">{mostActivePeriod.workouts}</p>
          <p className="text-xs text-gray-500">{mostActivePeriod.name}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
        <div className="rounded-full p-3 bg-purple-100 flex-shrink-0">
          <Calendar className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Average</p>
          <p className="text-2xl font-bold text-gray-800">{avgWorkoutsPerPeriod.toFixed(1)}</p>
          <p className="text-xs text-gray-500">per {view === 'weekly' ? 'week' : 'month'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
