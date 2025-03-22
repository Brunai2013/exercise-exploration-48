
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import ChartHeader from "./ChartHeader";
import ChartFilter from "./ChartFilter";
import ChartDisplay from "./ChartDisplay";
import { EmptyState, LoadingState } from "./ChartStates";

interface ExerciseProgressChartProps {
  data: ExerciseProgressItem[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date };
  timeFilter: 'week' | 'month' | 'custom';
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ 
  data, 
  isLoading,
  dateRange,
  timeFilter
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate list of unique exercises
  const uniqueExercises = useMemo(() => {
    const exercises = Array.from(new Set(data.map(item => item.exercise)));
    return exercises.sort();
  }, [data]);

  // Filter exercises by search query
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return uniqueExercises;
    return uniqueExercises.filter(exercise => 
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueExercises, searchQuery]);

  // Select first exercise if none selected
  useMemo(() => {
    if (uniqueExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(uniqueExercises[0]);
    }
  }, [uniqueExercises, selectedExercise]);

  if (isLoading) {
    return <Card><LoadingState /></Card>;
  }
  
  if (!data.length) {
    return (
      <Card>
        <ChartHeader 
          title="Exercise Progress" 
          description="Track your strength improvements over time" 
          infoText="Track your progress on specific exercises over time. Select an exercise to see how your weights and reps have changed."
        />
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  // Format date range for display
  const dateRangeText = `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  const timeDescription = timeFilter === 'week' ? 'Last Week' : 
                         timeFilter === 'month' ? 'Last Month' : dateRangeText;

  // Filter data for selected exercise
  const exerciseData = data.filter(item => item.exercise === selectedExercise);

  return (
    <Card className="overflow-hidden">
      <ChartHeader 
        title="Exercise Progress" 
        description={timeDescription}
        infoText="Select an exercise from the dropdown to see your progress. The chart shows weights and reps over time so you can track your improvements."
      />
      <CardContent>
        <ChartFilter
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredExercises={filteredExercises}
          exerciseData={exerciseData}
        />

        <ChartDisplay 
          exerciseData={exerciseData} 
          selectedExercise={selectedExercise}
        />
      </CardContent>
    </Card>
  );
};

export default ExerciseProgressChart;
