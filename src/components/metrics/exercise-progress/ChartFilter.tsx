
import React from 'react';
import { ExerciseProgressItem } from "@/hooks/metrics/useMetricsData";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartFilterProps {
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: string[];
  exerciseData: ExerciseProgressItem[];
}

const ChartFilter: React.FC<ChartFilterProps> = ({
  selectedExercise,
  setSelectedExercise,
  searchQuery,
  setSearchQuery,
  filteredExercises,
  exerciseData,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-1/3">
        <label htmlFor="exercise-select" className="text-sm font-medium mb-2 block">
          Select Exercise
        </label>
        <Select 
          value={selectedExercise} 
          onValueChange={setSelectedExercise}
        >
          <SelectTrigger id="exercise-select" className="w-full">
            <SelectValue placeholder="Select an exercise" />
          </SelectTrigger>
          <SelectContent>
            <div className="py-2 px-3 sticky top-0 bg-white z-10 border-b">
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredExercises.map(exercise => (
                <SelectItem key={exercise} value={exercise}>
                  {exercise}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>
      
      {exerciseData.length > 0 && (
        <div className="w-full sm:w-2/3 flex items-end">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-xs text-indigo-700 mb-1">Latest Weight</p>
              <p className="text-xl font-bold">{exerciseData[exerciseData.length - 1].weight} lbs</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-xs text-teal-700 mb-1">Latest Reps</p>
              <p className="text-xl font-bold">{exerciseData[exerciseData.length - 1].reps}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartFilter;
