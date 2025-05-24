
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Sparkles, Database, Settings } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
import { useBulkUrlUpdate } from '@/hooks/exercise/useBulkUrlUpdate';

interface ExerciseLibraryHeaderProps {
  onRefresh: () => void;
  onAddExercise: () => void;
  onOpenCurated: () => void;
  onOpenBackup: () => void;
}

const ExerciseLibraryHeader: React.FC<ExerciseLibraryHeaderProps> = ({
  onRefresh,
  onAddExercise,
  onOpenCurated,
  onOpenBackup
}) => {
  const { updateAllUrls, isUpdating } = useBulkUrlUpdate();

  return (
    <SectionHeader 
      title="Exercise Library" 
      description="Manage and organize your exercise database"
      action={
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={updateAllUrls}
            disabled={isUpdating}
            className="flex items-center gap-2"
            title="Fix all exercise image URLs"
          >
            <Database className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Fixing URLs...' : 'Fix URLs'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onOpenCurated}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Browse Curated
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onOpenBackup}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Backup
          </Button>
          
          <Button 
            onClick={onAddExercise}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Exercise
          </Button>
        </div>
      }
    />
  );
};

export default ExerciseLibraryHeader;
