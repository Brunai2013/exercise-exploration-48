import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
import { Dumbbell, InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { useState } from "react";

interface MuscleGroupsChartProps {
  data: MuscleGroupData[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
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

const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-midAngle * (Math.PI / 180));
  const cos = Math.cos(-midAngle * (Math.PI / 180));
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.8}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
        {payload.name} ({(percent * 100).toFixed(0)}%)
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
        {`${value} exercises`}
      </text>
    </g>
  );
};

const MuscleGroupsChart: React.FC<MuscleGroupsChartProps> = ({ data, isLoading, dateRange, timeFilter }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Muscle Groups Worked</CardTitle>
              <CardDescription>
                Track which muscle groups you're focusing on
              </CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About This Chart</h4>
                  <p className="text-sm">
                    Shows the distribution of muscle groups you've worked based on your completed workouts.
                    The chart displays the percentage of total exercises dedicated to each muscle group.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
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

  const formattedData = data.map(item => ({
    ...item,
    value: item.count
  }));

  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">Muscle Groups Worked</CardTitle>
            <CardDescription className="mt-1 text-base">
              {timeFilter === 'week' ? 'Last Week' : 
               timeFilter === 'month' ? 'Last Month' : dateRangeText}
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How to Use This Chart</h4>
                <p className="text-sm">
                  This chart shows how your workout exercises are distributed across different muscle groups.
                  Hover over sections to see details. Use this to identify any imbalances in your training.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/5 flex items-center justify-center">
            <div className="w-full h-[700px] flex items-center justify-center py-10">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={formattedData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={180}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      onMouseEnter={onPieEnter}
                      paddingAngle={2}
                    >
                      {formattedData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={1}
                        />
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
                            return [`${value} exercises (${item?.percentage || 0}%)`, "Exercises"];
                          }}
                        />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="w-full md:w-2/5 mt-8 md:mt-0 md:pl-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Most Worked Muscle Groups</h4>
            <div className="grid gap-4">
              {data.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-4 flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <span className="text-base font-medium text-gray-800">{item.name}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">
                        {item.count} exercise{item.count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Pro Tip:</span> For balanced muscle development, aim to work all major 
                muscle groups evenly over time.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupsChart;
