
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackupData } from './types';

/**
 * Downloads a backup file by its path
 */
export async function downloadExerciseBackup(path: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('exercise_backups')
      .download(path);
      
    if (error) {
      console.error('Error downloading backup:', error);
      toast.error(`Failed to download backup: ${error.message}`);
      return;
    }
    
    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'exercise-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Backup downloaded successfully');
  } catch (error) {
    console.error('Error downloading backup:', error);
    toast.error(`Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a local backup download when Supabase storage is unavailable
 */
export function downloadLocalBackup(data: BackupData, fileName: string): void {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Local backup downloaded successfully');
  } catch (error) {
    console.error('Error creating local backup:', error);
    toast.error(`Local backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
