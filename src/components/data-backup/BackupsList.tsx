
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { 
  listExerciseBackups, 
  downloadExerciseBackup, 
  createExerciseBackup,
  downloadLocalBackup,
} from '@/lib/backup';

// Import our new components
import BackupActions from './backup-list/BackupActions';
import BackupList from './backup-list/BackupList';
import BackupEmptyState from './backup-list/BackupEmptyState';
import BackupLoadingState from './backup-list/BackupLoadingState';

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
        <BackupActions 
          onRefresh={onBackupCreated}
          onCreateBackup={handleCreateBackup}
          isLoading={isLoading}
          isCreating={isCreating}
        />
        
        {isLoading ? (
          <BackupLoadingState />
        ) : backups.length === 0 ? (
          <BackupEmptyState />
        ) : (
          <BackupList 
            backups={backups} 
            onDownload={handleDownloadBackup} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BackupsList;
