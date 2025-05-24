
import { useState } from 'react';
import { bulkUpdateExerciseUrls } from '@/lib/exercises';
import { toast } from 'sonner';

export function useBulkUrlUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAllUrls = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      toast.info('Starting bulk URL update...', { id: 'bulk-update' });
      await bulkUpdateExerciseUrls();
      toast.success('All exercise URLs have been updated!', { id: 'bulk-update' });
    } catch (error) {
      console.error('Bulk URL update failed:', error);
      toast.error('Failed to update exercise URLs', { id: 'bulk-update' });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateAllUrls,
    isUpdating
  };
}
