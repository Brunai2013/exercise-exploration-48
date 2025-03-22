
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FrequencyData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine, 
  Legend,
  Label as RechartsLabel,
  Tooltip
} from "recharts";
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

  const totalWorkouts = data.reduce((sum, item) => sum + item.workouts, 0);
  const mostActiveIndex = data.reduce((maxIndex, item, index, arr) => 
    item.workouts > arr[maxIndex].workouts ? index : maxIndex, 0);
  const mostActivePeriod = data[mostActiveIndex];
  const avgWorkoutsPerPeriod = totalWorkouts / data.length || 0;

  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  const formatXAxisTick = (value: string) => {
    if (view === 'weekly' && value.includes('Week')) {
      const match = value.match(/Week (\d+)/);
      return match ? `Week ${match[1]}` : value;
    }
    if (view === 'monthly' && value.includes(' ')) {
      return value.split(' ')[0];
    }
    return value;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{formatXAxisTick(data.name)}</p>
          <p className="text-blue-600 font-bold mt-1">{data.workouts} workout{data.workouts !== 1 ? 's' : ''}</p>
          {data.dateRange && (
            <p className="text-gray-500 text-xs mt-1">{data.dateRange}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Workout Consistency
            </CardTitle>
            <CardDescription className="flex items-center mt-1 text-gray-500">
              {timeFilter === 'week' ? 'Last Week' : 
               timeFilter === 'month' ? 'Last Month' : dateRangeText}
              <Badge variant="outline" className="ml-2 capitalize">
                {view} view
              </Badge>
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <InfoIcon className="h-5 w-5" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">About This Chart</h4>
                <p className="text-sm text-gray-600">
                  This chart displays your workout frequency over time:
                </p>
                <ul className="text-sm list-disc pl-5 space-y-1 text-gray-600">
                  <li><strong>X-axis:</strong> Time periods ({view === 'weekly' ? 'weeks' : 'months'})</li>
                  <li><strong>Y-axis:</strong> Number of workouts completed</li>
                  <li><strong>Bars:</strong> Each bar represents workouts in a time period</li>
                  <li><strong>Dotted line:</strong> Your average workouts per {view === 'weekly' ? 'week' : 'month'}</li>
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-4">
        {/* Stats summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 px-2">
          <div className="bg-blue-50 p-3 rounded-xl shadow-sm">
            <p className="text-xs text-blue-700 font-medium mb-1">Total Workouts</p>
            <p className="text-2xl font-bold text-gray-800">{totalWorkouts}</p>
            <p className="text-xs text-gray-500 mt-1">
              {timeFilter === 'week' ? 'Last week' : 
               timeFilter === 'month' ? 'Last month' : 'Selected period'}
            </p>
          </div>
          <div className="bg-violet-50 p-3 rounded-xl shadow-sm">
            <p className="text-xs text-violet-700 font-medium mb-1">Peak Activity</p>
            <p className="text-2xl font-bold text-gray-800">
              {mostActivePeriod?.workouts || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {view === 'weekly' ? 'Most active week: ' : 'Most active month: '}
              {formatXAxisTick(mostActivePeriod?.name || 'None')}
            </p>
          </div>
          <div className="bg-teal-50 p-3 rounded-xl shadow-sm">
            <p className="text-xs text-teal-700 font-medium mb-1">Average Frequency</p>
            <p className="text-2xl font-bold text-gray-800">{avgWorkoutsPerPeriod.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Workouts per {view === 'weekly' ? 'week' : 'month'}
            </p>
          </div>
        </div>
        
        {/* Main chart */}
        <div className="h-[320px] mt-4 px-2">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 10, bottom: 30 }}
                barSize={40}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickLine={false}
                  axisLine={{ stroke: "#ddd" }}
                  tickFormatter={formatXAxisTick}
                  interval={0}
                  padding={{ left: 15, right: 15 }}
                >
                  <RechartsLabel 
                    value={view === 'weekly' ? 'Week' : 'Month'} 
                    position="insideBottom" 
                    offset={-5}
                    style={{ 
                      textAnchor: 'middle', 
                      fill: '#666', 
                      fontSize: 14,
                      fontWeight: 500 
                    }}
                  />
                </XAxis>
                <YAxis 
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#ddd" }}
                  tick={{ fontSize: 12, fill: "#666" }}
                  width={35}
                  domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
                >
                  <RechartsLabel 
                    value="Workouts" 
                    angle={-90} 
                    position="insideLeft"
                    style={{ 
                      textAnchor: 'middle', 
                      fill: '#666', 
                      fontSize: 14,
                      fontWeight: 500 
                    }}
                    offset={-5}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={avgWorkoutsPerPeriod} 
                  stroke="#6366F1" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  opacity={0.7}
                >
                  <RechartsLabel 
                    value={`Average: ${avgWorkoutsPerPeriod.toFixed(1)}`} 
                    position="right" 
                    fill="#6366F1"
                    style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      fill: '#6366F1' 
                    }}
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
                      fill={entry.color} 
                      fillOpacity={entry.workouts === 0 ? 0.4 : 0.95}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Explanation section moved below the chart */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100 mx-2">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <InfoIcon className="h-4 w-4 mr-1.5 text-blue-500" />
            Understanding Your Workout Consistency
          </h4>
          <p className="text-sm text-gray-600">
            This chart shows how many workouts you completed during each {view === 'weekly' ? 'week' : 'month'}.
            {avgWorkoutsPerPeriod < 2 
              ? ` Your average of ${avgWorkoutsPerPeriod.toFixed(1)} workouts per ${view === 'weekly' ? 'week' : 'month'} is below recommended frequency. Try to increase your consistency for better results.` 
              : ` With an average of ${avgWorkoutsPerPeriod.toFixed(1)} workouts per ${view === 'weekly' ? 'week' : 'month'}, you're maintaining good consistency!`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
