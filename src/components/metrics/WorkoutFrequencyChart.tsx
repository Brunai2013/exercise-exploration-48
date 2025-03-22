
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FrequencyData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Calendar, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WorkoutFrequencyChartProps {
  data: FrequencyData[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-cyan-100 p-3 mb-4">
      <Calendar className="h-6 w-6 text-cyan-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No workout frequency data</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete more workouts to see your training frequency
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const WorkoutFrequencyChart: React.FC<WorkoutFrequencyChartProps> = ({ data, isLoading, view }) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Workout Frequency</CardTitle>
              <CardDescription>
                Track how often you're working out
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2 capitalize">
              {view} view
            </Badge>
          </div>
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

  // Calculate stats
  const totalWorkouts = data.reduce((sum, item) => sum + item.workouts, 0);
  const mostActiveIndex = data.reduce((maxIndex, item, index, arr) => 
    item.workouts > arr[maxIndex].workouts ? index : maxIndex, 0);
  const mostActivePeriod = data[mostActiveIndex];
  const avgWorkoutsPerPeriod = totalWorkouts / data.length || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workout Frequency</CardTitle>
            <CardDescription>
              Track how often you're working out
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {view} view
            </Badge>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">How to Use This Chart</h4>
                  <p className="text-sm">
                    This chart shows how many workouts you completed in each {view === 'weekly' ? 'week' : 'month'}.
                    The dotted line shows your average workouts per {view === 'weekly' ? 'week' : 'month'}.
                    Toggle between weekly and monthly views using the tabs at the top of the page.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Total Workouts</p>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700 mb-1">Most Active</p>
            <p className="text-2xl font-bold">{mostActivePeriod?.name || 'N/A'}</p>
            <p className="text-xs text-purple-700">{mostActivePeriod?.workouts || 0} workouts</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <p className="text-sm text-teal-700 mb-1">Avg. Workouts {view === 'weekly' ? '/Week' : '/Month'}</p>
            <p className="text-2xl font-bold">{avgWorkoutsPerPeriod.toFixed(1)}</p>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  allowDecimals={false}
                  tickLine={false}
                  domain={[0, 'dataMax + 1']}
                  label={{ value: 'Workouts', angle: -90, position: 'insideLeft' }}
                />
                <ReferenceLine y={avgWorkoutsPerPeriod} stroke="#888" strokeDasharray="3 3" />
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(value) => `${value}`}
                    />
                  )}
                />
                <Bar 
                  dataKey="workouts" 
                  name={`Workouts per ${view === 'weekly' ? 'Week' : 'Month'}`} 
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      fillOpacity={entry.workouts === 0 ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            The dashed line represents your average of {avgWorkoutsPerPeriod.toFixed(1)} workouts per {view === 'weekly' ? 'week' : 'month'}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
