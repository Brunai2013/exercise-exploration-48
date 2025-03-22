
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine,
  Tooltip,
} from "recharts";
import { formatXAxisTick, CustomTooltip } from './utils';

interface FrequencyChartProps {
  data: any[];
  avgWorkoutsPerPeriod: number;
  view: 'weekly' | 'monthly';
}

const FrequencyChart: React.FC<FrequencyChartProps> = ({ data, avgWorkoutsPerPeriod, view }) => {
  // Generate colors based on data
  const enhancedData = data.map(item => ({
    ...item,
    color: item.workouts > avgWorkoutsPerPeriod ? '#4F46E5' : '#93C5FD'
  }));
  
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Workout Frequency</h3>
        <p className="text-sm text-gray-500">
          {view === 'weekly' ? 'Number of workouts completed each week' : 'Number of workouts completed each month'}
        </p>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={enhancedData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            barSize={view === 'weekly' ? 35 : 50}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
            <XAxis 
              dataKey="name"
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              tickMargin={10}
              height={40}
              label={{ 
                value: view === 'weekly' ? 'Week' : 'Month', 
                position: 'insideBottom', 
                offset: -20,
                fontSize: 12,
                fill: "#6B7280"
              }}
            />
            <YAxis 
              allowDecimals={false}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
              width={40}
              label={{ 
                value: "Workouts", 
                angle: -90, 
                position: 'insideLeft', 
                offset: -5,
                fontSize: 12,
                fill: "#6B7280"
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={avgWorkoutsPerPeriod} 
              stroke="#6366F1" 
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{ 
                value: `Avg: ${avgWorkoutsPerPeriod.toFixed(1)}`,
                position: 'right',
                fontSize: 12,
                fill: '#6366F1'
              }}
            />
            <Bar 
              dataKey="workouts" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {enhancedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FrequencyChart;
