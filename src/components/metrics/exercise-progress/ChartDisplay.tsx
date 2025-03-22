
import React from 'react';
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Search } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ChartDisplayProps {
  exerciseData: ExerciseProgressItem[];
  selectedExercise: string;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ exerciseData, selectedExercise }) => {
  if (!exerciseData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4 bg-gray-50 rounded-lg">
        <Search className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-base font-medium">No data for this exercise</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select a different exercise or complete more workouts
        </p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = exerciseData.map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    weight: item.weight,
    reps: item.reps,
    fullDate: item.date
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" tickFormatter={(value) => `${value} lbs`} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name, props) => {
              if (name === 'weight') return [`${value} lbs`, 'Weight'];
              if (name === 'reps') return [`${value}`, 'Reps'];
              return [value, name];
            }}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.date === label);
              return item ? format(parseISO(item.fullDate), 'MMMM d, yyyy') : label;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="weight"
            stroke="#6366f1"
            activeDot={{ r: 8 }}
            name="Weight"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="reps"
            stroke="#14b8a6"
            name="Reps"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartDisplay;
