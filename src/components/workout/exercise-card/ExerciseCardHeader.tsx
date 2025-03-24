
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
    <div className="flex items-start justify-between mb-1">
      <div>
        <h4 className={`${isCompact ? 'text-sm font-medium' : 'text-lg font-medium'} line-clamp-1`}>{exerciseName}</h4>
        <div className="flex items-center mt-0.5">
          <Badge className={`mr-2 text-xs py-0 px-1.5 ${category.color}`}>
            {category.name}
          </Badge>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} ${exerciseProgress === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>
      
      {onRemoveFromGroup && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFromGroup();
          }}
          title="Remove from group"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default ExerciseCardHeader;
