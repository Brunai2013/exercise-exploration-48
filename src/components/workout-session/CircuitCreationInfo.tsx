
import React from 'react';
import { Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CircuitCreationInfoProps {
  groupingMode: boolean;
  selectedExercises: string[];
}

const CircuitCreationInfo: React.FC<CircuitCreationInfoProps> = ({
  groupingMode,
  selectedExercises
}) => {
  if (!groupingMode) return null;
  
  return (
    <div className="bg-muted/20 p-4 rounded-lg mb-4 flex items-center">
      <Layers className="h-5 w-5 mr-2 text-muted-foreground" />
      <div className="flex-1">
        <h4 className="font-medium">Create Exercise Group</h4>
        <p className="text-sm text-muted-foreground">Select 2 or more exercises to group together as a circuit.</p>
      </div>
      <div className="flex items-center">
        <span className="mr-2">Selected: {selectedExercises.length}</span>
        {selectedExercises.length > 0 && (
          <Badge variant="outline">{selectedExercises.length}</Badge>
        )}
      </div>
    </div>
  );
};

export default CircuitCreationInfo;
