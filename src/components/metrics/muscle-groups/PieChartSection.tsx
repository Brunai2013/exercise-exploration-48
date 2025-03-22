
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer
} from "recharts";
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { renderCustomizedLabel, renderActiveShape, usePieActiveState } from "./MuscleGroupChartRenderers";

interface PieChartSectionProps {
  data: MuscleGroupData[];
  chartConfig: Record<string, { color: string }>;
}

// Component for the pie chart visualization
const PieChartSection: React.FC<PieChartSectionProps> = ({ data, chartConfig }) => {
  const { activeIndex, onPieEnter } = usePieActiveState();
  
  const formattedData = data.map(item => ({
    ...item,
    value: item.count
  }));

  return (
    <div className="w-full md:w-3/5 h-full flex items-center justify-center py-8">
      <div className="w-full h-full" style={{ minHeight: '450px' }}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={450}>
            <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
                label={renderCustomizedLabel}
                labelLine={false}
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
  );
};

export default PieChartSection;
