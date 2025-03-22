
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Dumbbell, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MuscleGroupsChartProps {
  data: MuscleGroupData[];
  isLoading: boolean;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-blue-100 p-3 mb-4">
      <Dumbbell className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No workout data yet</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete workouts to see which muscle groups you're focusing on
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
    <div className="flex flex-wrap gap-2 mt-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

const MuscleGroupsChart: React.FC<MuscleGroupsChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muscle Groups Worked</CardTitle>
          <CardDescription>
            Track which muscle groups you're focusing on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  const chartConfig = data.reduce((config, item) => {
    config[item.name] = { color: item.color };
    return config;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Muscle Groups Worked</CardTitle>
        <CardDescription>
          See which muscle groups you've been focusing on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as MuscleGroupData;
                        return item ? `${item.name}` : "";
                      }}
                      formatter={(value, name) => {
                        const item = data.find(d => d.name === name);
                        return [`${value} exercises (${item?.percentage || 0}%)`, name];
                      }}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Most Worked Muscle Groups</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="flex items-center p-3 rounded-lg border"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} exercises ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsChart;
