
import React from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackupActionsProps {
  onRefresh: () => Promise<void>;
  onCreateBackup: () => Promise<void>;
  isLoading: boolean;
  isCreating: boolean;
}

const BackupActions: React.FC<BackupActionsProps> = ({ 
  onRefresh, 
  onCreateBackup, 
  isLoading, 
  isCreating 
}) => {
  return (
    <div className="flex justify-end mb-4">
      <Button 
        variant="outline" 
        className="mr-2"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button 
        onClick={onCreateBackup}
        disabled={isLoading || isCreating}
      >
        <Save className="h-4 w-4 mr-2" />
        Create New Backup
      </Button>
    </div>
  );
};

export default BackupActions;
