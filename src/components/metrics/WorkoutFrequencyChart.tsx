
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
  Tooltip,
  Label as RechartsLabel
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
    <div className="rounded-full bg-blue-50 p-3 mb-4">
      <Calendar className="h-6 w-6 text-blue-500" />
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

  const CustomTooltip = ({ active, payload }: any) => {
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

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Workout Consistency
            </CardTitle>
            <CardDescription className="mt-1 text-gray-500">
              {timeFilter === 'week' ? 'Last Week' : 
               timeFilter === 'month' ? 'Last Month' : dateRangeText}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {view} view
            </Badge>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                  <InfoIcon className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <h4 className="text-sm font-semibold">About This Chart</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This chart shows your workout frequency over time. The dotted line represents your average.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Stats summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Total Workouts</p>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-700 font-medium">Peak Activity</p>
            <p className="text-2xl font-bold">{mostActivePeriod?.workouts || 0}</p>
            <p className="text-xs text-gray-500 truncate">
              {formatXAxisTick(mostActivePeriod?.name || 'None')}
            </p>
          </div>
          <div className="bg-teal-50 p-3 rounded-lg">
            <p className="text-xs text-teal-700 font-medium">Average</p>
            <p className="text-2xl font-bold">{avgWorkoutsPerPeriod.toFixed(1)}</p>
            <p className="text-xs text-gray-500">
              per {view === 'weekly' ? 'week' : 'month'}
            </p>
          </div>
        </div>
        
        {/* Main chart */}
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

        {/* Explanation section - now below the chart, not overlapping */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="font-medium flex items-center text-sm">
            <InfoIcon className="h-4 w-4 mr-1.5 text-blue-500" />
            Understanding Your Workout Consistency
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            This chart shows your workout frequency over time. 
            {avgWorkoutsPerPeriod < 2 
              ? " Try to increase your consistency for better results." 
              : " You're maintaining good consistency!"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFrequencyChart;
