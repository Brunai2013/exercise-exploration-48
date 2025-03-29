
import React from 'react';
import { Button } from '@/components/ui/button';
import { Layers, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CircuitActionsProps {
  groupingMode: boolean;
  selectedExercises: string[];
  startGroupingMode: () => void;
  cancelGroupingMode: () => void;
  handleCreateCustomGroup: () => void;
}

const CircuitActions: React.FC<CircuitActionsProps> = ({
  groupingMode,
  selectedExercises,
  startGroupingMode,
  cancelGroupingMode,
  handleCreateCustomGroup
}) => {
  return (
    <div className="mb-6 flex justify-end">
      {groupingMode ? (
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm"
            onClick={handleCreateCustomGroup}
            disabled={selectedExercises.length < 2}
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-sm rounded-full px-5 py-2"
          >
            <Layers className="h-4 w-4 mr-2" />
            Create Circuit
            <Sparkles className="h-3 w-3 ml-2 text-white/70" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={cancelGroupingMode}
            className="rounded-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="secondary"
          onClick={startGroupingMode}
          className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg rounded-full border-none"
        >
          <Layers className="h-5 w-5 mr-2" />
          Group Exercises
          <Sparkles className="h-4 w-4 ml-2 text-white/70" />
        </Button>
      )}
    </div>
  );
};

export default CircuitActions;
