
import React, { useState } from 'react';
import { RefreshCw, Download, Save, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  listExerciseBackups, 
  downloadExerciseBackup, 
  createExerciseBackup,
  isCompleteBackup,
  formatBackupDate,
  downloadLocalBackup,
} from '@/lib/backup';

interface BackupsListProps {
  backups: { name: string; path: string; created_at: string }[];
  isLoading: boolean;
  onBackupCreated: () => Promise<void>;
}

const BackupsList: React.FC<BackupsListProps> = ({ 
  backups, 
  isLoading, 
  onBackupCreated 
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const result = await createExerciseBackup();
      
      if (result) {
        if (result.path) {
          // Supabase storage backup successful
          toast.success('Complete backup created and stored in Supabase');
          await onBackupCreated();
        } else if (result.data && result.fileName) {
          // Local backup needed - RLS policy prevented storage
          downloadLocalBackup(result.data, result.fileName);
          toast.success('Complete local backup created successfully');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="mr-2 h-5 w-5 text-primary" />
          Available Backups
        </CardTitle>
        <CardDescription>
          View and manage your database backups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={onBackupCreated}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleCreateBackup}
            disabled={isLoading || isCreating}
          >
            <Save className="h-4 w-4 mr-2" />
            Create New Backup
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary/70 mb-2" />
            <p>Loading backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-md bg-slate-50">
            <Database className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <p className="text-lg font-medium text-slate-500 mb-1">No backups found</p>
            <p className="text-sm">Create your first backup using the button above.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="divide-y">
              {backups.map((backup) => (
                <div 
                  key={backup.path} 
                  className="flex justify-between items-center p-4 hover:bg-slate-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate max-w-[300px]">{backup.name}</p>
                      {isCompleteBackup(backup.name) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatBackupDate(backup.created_at)}</p>
                  </div>
                  <Button
                    variant="outline"
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
      </CardContent>
    </Card>
  );
};

export default BackupsList;
