
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Download, Save } from 'lucide-react';
import { 
  listExerciseBackups, 
  downloadExerciseBackup, 
  createExerciseBackup,
  isCompleteBackup,
  formatBackupDate,
  downloadLocalBackup,
} from '@/lib/backup';

interface AvailableBackupsTabProps {
  onRefreshData: () => void;
}

const AvailableBackupsTab: React.FC<AvailableBackupsTabProps> = ({ onRefreshData }) => {
  const [backups, setBackups] = useState<{ name: string; path: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Load backups when the component mounts
  useEffect(() => {
    loadBackups();
  }, []);
  
  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupsList = await listExerciseBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Failed to load backup list');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const result = await createExerciseBackup();
      
      if (result) {
        if (result.path) {
          // Supabase storage backup successful
          toast.success('Complete backup created successfully');
          await loadBackups();
        } else if (result.data && result.fileName) {
          // Local backup needed
          downloadLocalBackup(result.data, result.fileName);
        }
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDownloadBackup = async (path: string) => {
    try {
      await downloadExerciseBackup(path);
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Backup Files</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadBackups}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleCreateBackup}
            disabled={isLoading || isCreating}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          Loading backups...
        </div>
      ) : backups.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No backups found. Create your first backup using the button above.
        </div>
      ) : (
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-2">
            {backups.map((backup) => (
              <div 
                key={backup.path} 
                className="flex justify-between items-center p-3 rounded-md border hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate max-w-[300px]">{backup.name}</p>
                    {isCompleteBackup(backup.name) && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatBackupDate(backup.created_at)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadBackup(backup.path)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );
};

export default AvailableBackupsTab;
