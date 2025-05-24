
import { useState } from 'react';
import { clearAllExercises } from '@/lib/exercises';
import { toast } from 'sonner';

export function useClearExercises() {
  const [isClearing, setIsClearing] = useState(false);

  const clearAll = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      toast.info('Clearing all exercises...', { id: 'clear-exercises' });
      await clearAllExercises();
      toast.success('All exercises have been cleared!', { id: 'clear-exercises' });
    } catch (error) {
      console.error('Clear exercises failed:', error);
      toast.error('Failed to clear exercises', { id: 'clear-exercises' });
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearAll,
    isClearing
  };
}
