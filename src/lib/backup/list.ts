
import { supabase } from '@/integrations/supabase/client';
import { BackupFile } from './types';
import { toast } from 'sonner';

/**
 * Lists all available backups in the storage bucket
 */
export async function listExerciseBackups(): Promise<BackupFile[]> {
  try {
    const { data, error } = await supabase.storage
      .from('exercise_backups')
      .list();
      
    if (error) {
      console.error('Error listing backups:', error);
      toast.error(`Failed to list backups: ${error.message}`);
      return [];
    }
    
    return data
      .filter(item => !item.id.endsWith('/'))
      .map(item => ({
        name: item.name,
        path: item.name,
        created_at: item.created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error listing backups:', error);
    toast.error(`Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}
