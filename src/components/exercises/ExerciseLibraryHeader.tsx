
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Sparkles, Database, Settings, Trash2 } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
import { useBulkUrlUpdate } from '@/hooks/exercise/useBulkUrlUpdate';
import { useClearExercises } from '@/hooks/exercise/useClearExercises';

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
  const { clearAll, isClearing } = useClearExercises();

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL exercises? This action cannot be undone.')) {
      await clearAll();
      onRefresh(); // Refresh the data after clearing
    }
  };

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
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            title="Clear all exercises from database"
          >
            <Trash2 className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear All'}
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
