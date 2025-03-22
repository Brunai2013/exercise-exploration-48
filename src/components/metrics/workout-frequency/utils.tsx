
import React from 'react';
import { CalendarDays } from 'lucide-react';

export const formatXAxisTick = (value: string) => {
  if (value.includes('Week')) {
    const match = value.match(/Week (\d+)/);
    return match ? `Week ${match[1]}` : value;
  }
  if (value.includes(' ')) {
    return value.split(' ')[0];
  }
  return value;
};

export const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800 flex items-center">
          {formatXAxisTick(data.name)}
        </p>
        <div className="flex items-center mt-2">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.color }} />
          <p className="text-blue-600 font-bold">
            {data.workouts} workout{data.workouts !== 1 ? 's' : ''}
          </p>
        </div>
        {data.dateRange && (
          <div className="flex items-center mt-2 text-gray-500 text-xs">
            <CalendarDays className="h-3 w-3 mr-1" />
            <p>{data.dateRange}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};
