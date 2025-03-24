
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExerciseCardHeaderProps {
  exerciseName: string;
  category: { name: string; color: string };
  completedSets: number;
  totalSets: number;
  exerciseProgress: number;
  isCompact?: boolean;
  onRemoveFromGroup?: () => void;
}

const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  exerciseName,
  category,
  completedSets,
  totalSets,
  exerciseProgress,
  isCompact,
  onRemoveFromGroup
}) => {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <h4 className={`${isCompact ? 'text-base' : 'text-lg'} font-medium`}>{exerciseName}</h4>
        <div className="flex items-center mt-1">
          <Badge className={`mr-2 ${category.color}`}>
            {category.name}
          </Badge>
          <span className={`text-sm ${exerciseProgress === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>
      
      {/* Remove from group button if applicable */}
      {onRemoveFromGroup && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFromGroup();
          }}
          title="Remove from group"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ExerciseCardHeader;
