
import { MuscleGroupData } from "@/hooks/metrics/useMetricsData";

interface MuscleGroupTilesProps {
  data: MuscleGroupData[];
}

// Component for displaying the muscle group tiles
const MuscleGroupTiles: React.FC<MuscleGroupTilesProps> = ({ data }) => {
  return (
    <div className="w-full md:w-2/5 p-6 py-8 flex flex-col">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">Most Worked Muscle Groups</h4>
      <div className="grid gap-3">
        {data.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <div 
              className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <span className="text-base font-medium text-gray-800">{item.name}</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {item.value || item.count} exercise{(item.value || item.count) !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {item.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pro Tip section - improved positioning and size */}
      <div className="mt-auto pt-8">
        <div className="px-6 py-5 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-base text-blue-800 leading-relaxed">
            <span className="font-semibold">Pro Tip:</span> For balanced muscle development, aim to work all major 
            muscle groups evenly over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MuscleGroupTiles;
