
import React from 'react';

interface ExerciseDataItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  category: string;
  color: string;
  displayText: string;
}

interface ExerciseBreakdownGridProps {
  exerciseData: ExerciseDataItem[];
}

const ExerciseBreakdownGrid: React.FC<ExerciseBreakdownGridProps> = ({ exerciseData }) => {
  // Split exercises into two columns
  const firstColumnExercises = exerciseData.slice(0, Math.ceil(exerciseData.length / 2));
  const secondColumnExercises = exerciseData.slice(Math.ceil(exerciseData.length / 2));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First Column */}
      <div className="space-y-3">
        {firstColumnExercises.length > 0 ? (
          firstColumnExercises.map((exercise) => (
            <ExerciseProgressItem key={exercise.id} exercise={exercise} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">No exercise data available</div>
        )}
      </div>
      
      {/* Second Column */}
      <div className="space-y-3">
        {secondColumnExercises.length > 0 ? (
          secondColumnExercises.map((exercise) => (
            <ExerciseProgressItem key={exercise.id} exercise={exercise} />
          ))
        ) : null}
      </div>
    </div>
  );
};

const ExerciseProgressItem: React.FC<{ exercise: ExerciseDataItem }> = ({ exercise }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: exercise.color }}
        />
        <span className="text-sm font-medium">{exercise.name}</span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full" 
            style={{ 
              width: `${exercise.percentage}%`,
              backgroundColor: exercise.color 
            }}
          />
        </div>
        <span className="ml-3 whitespace-nowrap">{exercise.displayText}</span>
      </div>
    </div>
  );
};

export default ExerciseBreakdownGrid;
