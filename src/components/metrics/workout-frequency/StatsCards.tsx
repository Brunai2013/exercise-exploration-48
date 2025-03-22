
import React from 'react';
import { formatXAxisTick } from './utils';

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
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-700 font-medium">Total Workouts</p>
        <p className="text-2xl font-bold">{totalWorkouts}</p>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg">
        <p className="text-xs text-purple-700 font-medium">Peak Activity</p>
        <p className="text-2xl font-bold">{mostActivePeriod?.workouts || 0}</p>
        <p className="text-xs text-gray-500 truncate">
          {formatXAxisTick(mostActivePeriod?.name || 'None')}
        </p>
      </div>
      <div className="bg-teal-50 p-3 rounded-lg">
        <p className="text-xs text-teal-700 font-medium">Average</p>
        <p className="text-2xl font-bold">{avgWorkoutsPerPeriod.toFixed(1)}</p>
        <p className="text-xs text-gray-500">
          per {view === 'weekly' ? 'week' : 'month'}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
