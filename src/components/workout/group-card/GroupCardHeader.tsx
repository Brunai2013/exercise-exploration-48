
import React from 'react';
import { Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupCardHeaderProps {
  progress: number;
  onUngroupAll?: () => void;
}

const GroupCardHeader: React.FC<GroupCardHeaderProps> = ({
  progress,
  onUngroupAll,
}) => {
  return (
    <div className="bg-green-100 py-1.5 px-3 flex items-center justify-between border-b border-green-200">
      <div className="flex items-center space-x-2">
        <Layers className="h-4 w-4 text-green-600" />
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-green-800">Circuit</span>
          <span className="text-xs text-green-700">{progress}% complete</span>
        </div>
      </div>
      
      {onUngroupAll && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-green-600 hover:text-red-500" 
          title="Ungroup all exercises"
          onClick={onUngroupAll}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default GroupCardHeader;
