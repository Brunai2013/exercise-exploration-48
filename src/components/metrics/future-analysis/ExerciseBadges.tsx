
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface ExerciseDataItem {
  id: string;
  name: string;
  color: string;
}

interface ExerciseBadgesProps {
  exerciseData: ExerciseDataItem[];
}

const ExerciseBadges: React.FC<ExerciseBadgesProps> = ({ exerciseData }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {exerciseData.map(exercise => (
        <Badge 
          key={exercise.id}
          variant="outline"
          className="cursor-pointer"
          style={{ 
            borderColor: exercise.color,
            color: 'inherit'
          }}
        >
          {exercise.name}
        </Badge>
      ))}
    </div>
  );
};

export default ExerciseBadges;
