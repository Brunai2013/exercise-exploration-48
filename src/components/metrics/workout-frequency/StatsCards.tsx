
import React from 'react';
import { formatXAxisTick } from './utils';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface StatsCardsProps {
  totalWorkouts: number;
  mostActivePeriod: { name: string; workouts: number } | undefined;
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
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-blue-50 p-2 rounded-full mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium">Total Workouts</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-purple-50 p-2 rounded-full mr-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium">Peak Activity</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{mostActivePeriod?.workouts || 0}</p>
        <p className="text-xs text-gray-500 truncate mt-1">
          {formatXAxisTick(mostActivePeriod?.name || 'None')}
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-teal-50 p-2 rounded-full mr-3">
            <Calendar className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium">Average</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{avgWorkoutsPerPeriod.toFixed(1)}</p>
        <p className="text-xs text-gray-500 mt-1">
          per {view === 'weekly' ? 'week' : 'month'}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
