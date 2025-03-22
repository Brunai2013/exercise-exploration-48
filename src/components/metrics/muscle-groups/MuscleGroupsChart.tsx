
import { Card, CardContent } from "@/components/ui/card";
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";
import { useState } from "react";
import { LoadingState, EmptyStateCard, ChartHeader } from "./MuscleGroupStates";
import MuscleGroupTiles from "./MuscleGroupTiles";
import PieChartSection from "./PieChartSection";

interface MuscleGroupsChartProps {
  data: MuscleGroupData[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const MuscleGroupsChart: React.FC<MuscleGroupsChartProps> = ({ 
  data, 
  isLoading, 
  dateRange, 
  timeFilter 
}) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return <EmptyStateCard dateRange={dateRange} timeFilter={timeFilter} />;
  }

  // Generate chart configuration from data
  const chartConfig = data.reduce((config, item) => {
    config[item.name] = { color: item.color };
    return config;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className="overflow-hidden h-full">
      <ChartHeader dateRange={dateRange} timeFilter={timeFilter} />
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">
          <PieChartSection data={data} chartConfig={chartConfig} />
          <MuscleGroupTiles data={data} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsChart;
