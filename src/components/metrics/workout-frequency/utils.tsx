
import React from 'react';

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
      <div className="bg-white p-3 rounded-lg shadow border border-gray-100">
        <p className="font-medium text-gray-800">{formatXAxisTick(data.name)}</p>
        <p className="text-blue-600 font-bold mt-1">
          {data.workouts} workout{data.workouts !== 1 ? 's' : ''}
        </p>
        {data.dateRange && (
          <p className="text-gray-500 text-xs mt-1">{data.dateRange}</p>
        )}
      </div>
    );
  }
  return null;
};
