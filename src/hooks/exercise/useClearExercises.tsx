
import { useState } from 'react';
import { clearAllExercises } from '@/lib/exercises';
import { toast } from 'sonner';

export function useClearExercises() {
  const [isClearing, setIsClearing] = useState(false);

  const clearAll = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      console.log('🗑️ CLEAR ALL HOOK - Starting clear operation...');
      toast.info('Clearing all exercises...', { id: 'clear-exercises' });
      
      await clearAllExercises();
      
      console.log('✅ CLEAR ALL HOOK - Clear operation completed successfully');
      toast.success('All exercises have been cleared!', { id: 'clear-exercises' });
    } catch (error) {
      console.error('❌ CLEAR ALL HOOK - Clear exercises failed:', error);
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
