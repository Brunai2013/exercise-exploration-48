
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";
import { Cell, Label, LabelList, Pie, Sector } from "recharts";
import { useState } from "react";

// Shared label renderer for the pie chart
export const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  // Increase the distance of the label from the pie chart
  const ex = cx + (outerRadius + 40) * cos;
  const ey = cy + (outerRadius + 40) * sin;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  
  return (
    <g>
      <path d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${ex},${ey}`} stroke={fill} fill="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="#333" 
        fontSize={12} 
        fontWeight="500"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={18} 
        textAnchor={textAnchor} 
        fill="#666" 
        fontSize={11}
      >
        {value} exercises
      </text>
    </g>
  );
};

// Active shape renderer for hover effects
export const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
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
    </g>
  );
};

// Hook for handling active pie segment
export const usePieActiveState = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  return { activeIndex, onPieEnter };
};
