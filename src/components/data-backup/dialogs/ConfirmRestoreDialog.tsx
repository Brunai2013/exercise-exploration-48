
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { restoreFromBackup } from '@/lib/backup';

interface ConfirmRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onRestoreComplete: () => void;
}

const ConfirmRestoreDialog: React.FC<ConfirmRestoreDialogProps> = ({ 
  open, 
  onOpenChange, 
  file,
  onRestoreComplete
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  
  const confirmRestore = async () => {
    if (!file) return;
    
    setIsRestoring(true);
    try {
      const success = await restoreFromBackup(file);
      if (success) {
        toast.success('Backup restored successfully');
        onRestoreComplete();
      }
    } finally {
      setIsRestoring(false);
      onOpenChange(false);
    }
  };
  
  // Check if complete backup
  const isCompleteBackup = file?.name.toLowerCase().includes('complete') || false;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Restore</AlertDialogTitle>
          <AlertDialogDescription>
            {isCompleteBackup ? (
              <p>
                You are about to restore a <strong>complete backup</strong> that contains your entire
                exercise library, workout history, and performance data.
              </p>
            ) : (
              <p>
                This will merge the backup data with your existing exercises and categories.
              </p>
            )}
            <p className="mt-2">
              Any conflicts will be resolved by keeping the backup version.
              This operation cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmRestore} disabled={isRestoring}>
            {isRestoring ? 'Restoring...' : 'Proceed with Restore'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmRestoreDialog;
