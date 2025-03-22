
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FrequencyData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Calendar, InfoIcon, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";

interface WorkoutFrequencyChartProps {
  data: FrequencyData[];
  isLoading: boolean;
  view: 'weekly' | 'monthly';
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80 text-center p-4">
    <div className="rounded-full bg-cyan-100 p-3 mb-4">
      <Calendar className="h-6 w-6 text-cyan-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No workout data available</h3>
    <p className="text-muted-foreground mb-4 max-w-md">
      Complete more workouts to track your training consistency
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const WorkoutFrequencyChart: React.FC<WorkoutFrequencyChartProps> = ({ 
  data, 
  isLoading, 
  view,
  dateRange,
  timeFilter
}) => {
  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Workout Consistency</CardTitle>
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

  // Format date range for display
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  // Custom tick formatter to make labels more readable
  const formatXAxisTick = (value: string) => {
    // For weekly view, simplify to just "Week X" 
    if (view === 'weekly' && value.includes('Week')) {
      const match = value.match(/Week (\d+)/);
      return match ? `Week ${match[1]}` : value;
    }
    // For monthly view, just show month name
    if (view === 'monthly' && value.includes(' ')) {
      return value.split(' ')[0]; // Just return the month name
    }
    return value;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Workout Consistency
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              {timeFilter === 'week' ? 'Last Week' : 
               timeFilter === 'month' ? 'Last Month' : dateRangeText}
              <Badge variant="outline" className="ml-2 capitalize">
                {view} view
              </Badge>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About Workout Consistency</h4>
                  <p className="text-sm">
                    This chart shows how many workouts you completed during each time period.
                    Each bar represents the number of workouts you did during that {view === 'weekly' ? 'week' : 'month'}.
                    The dotted line shows your average workouts per {view === 'weekly' ? 'week' : 'month'}.
                  </p>
                  <h4 className="text-sm font-semibold mt-2">How to use</h4>
                  <p className="text-sm">
                    Hover over each bar to see exact workout counts. 
                    Look for trends in your consistency and try to maintain or increase your 
                    average frequency for better results.
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
            <p className="text-xs text-muted-foreground">
              In selected time period
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700 mb-1">Peak Activity</p>
            <p className="text-2xl font-bold">
              {mostActivePeriod?.workouts || 0} workouts
            </p>
            <p className="text-xs text-muted-foreground">
              {view === 'weekly' ? 'Best week' : 'Best month'}: {formatXAxisTick(mostActivePeriod?.name || 'None')}
            </p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <p className="text-sm text-teal-700 mb-1">Average Frequency</p>
            <p className="text-2xl font-bold">{avgWorkoutsPerPeriod.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">
              Workouts per {view === 'weekly' ? 'week' : 'month'}
            </p>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 5, right: 20, left: 10, bottom: 40 }}
                barGap={10}
                barSize={50}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={formatXAxisTick}
                />
                <YAxis 
                  allowDecimals={false}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.max(dataMax + 1, 3)]}
                  label={{ 
                    value: 'Workouts', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <ReferenceLine 
                  y={avgWorkoutsPerPeriod} 
                  stroke="#888" 
                  strokeDasharray="3 3"
                  isFront={false}
                >
                  <label position="right" value="Average" fill="#888" />
                </ReferenceLine>
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
                  name={`Workouts`} 
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

        <div className="mt-4 text-sm flex items-start">
          <div className="bg-gray-100 p-3 rounded-lg w-full">
            <p className="font-medium mb-1">What this means:</p>
            <p className="text-muted-foreground">
              The dashed line shows your average of {avgWorkoutsPerPeriod.toFixed(1)} workouts per {view === 'weekly' ? 'week' : 'month'}.
              {avgWorkoutsPerPeriod < 2 ? 
                " Try to increase your consistency for better results." : 
                " You're maintaining good workout consistency!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
