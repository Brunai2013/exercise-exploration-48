
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
  Label as RechartsLabel
} from "recharts";
import { formatXAxisTick, CustomTooltip } from './utils';

interface FrequencyChartProps {
  data: any[];
  avgWorkoutsPerPeriod: number;
  view: 'weekly' | 'monthly';
}

const FrequencyChart: React.FC<FrequencyChartProps> = ({ data, avgWorkoutsPerPeriod, view }) => {
  return (
    <div className="h-[300px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name"
            axisLine={{ stroke: "#ddd" }}
            tickFormatter={formatXAxisTick}
            tick={{ fontSize: 12, fill: "#666" }}
            tickLine={false}
          >
            <RechartsLabel 
              value={view === 'weekly' ? 'Week' : 'Month'} 
              position="insideBottom" 
              offset={-10} 
              style={{ fontWeight: 500, fill: '#666', fontSize: 12 }}
            />
          </XAxis>
          <YAxis 
            allowDecimals={false}
            axisLine={{ stroke: "#ddd" }}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#666" }}
            domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
          >
            <RechartsLabel 
              value="Workouts" 
              angle={-90} 
              position="insideLeft" 
              style={{ fontWeight: 500, fill: '#666', fontSize: 12 }}
              offset={-5}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={avgWorkoutsPerPeriod} 
            stroke="#6366F1" 
            strokeDasharray="3 3"
            strokeWidth={1.5}
          >
            <RechartsLabel 
              value={`Avg: ${avgWorkoutsPerPeriod.toFixed(1)}`} 
              position="right" 
              style={{ fontSize: 12, fill: '#6366F1', fontWeight: 500 }}
            />
          </ReferenceLine>
          <Bar 
            dataKey="workouts" 
            name="Workouts" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || "#2563EB"} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyChart;
