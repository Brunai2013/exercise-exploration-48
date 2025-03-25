
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExerciseData } from '@/hooks/useExerciseData';

// Import the new components
import AvailableBackupsTab from './AvailableBackupsTab';
import RestoreBackupTab from './RestoreBackupTab';
import ConfirmRestoreDialog from './ConfirmRestoreDialog';

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefreshData: () => void;
}

const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({
  isOpen,
  onOpenChange,
  onRefreshData,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setUploadedFile(null);
    }
  }, [isOpen]);

  const handleRestoreBackup = () => {
    if (!uploadedFile) return;
    setConfirmDialogOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };
  
  const handleRestoreComplete = () => {
    onRefreshData();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b mb-4">
            <DialogTitle className="text-xl font-bold text-primary">Exercise Library Backup</DialogTitle>
            <DialogDescription className="mt-1 text-sm">
              Create comprehensive backups of your fitness data or restore from a previous backup
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="backups" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="backups" className="flex-1">Available Backups</TabsTrigger>
              <TabsTrigger value="restore" className="flex-1">Restore Backup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="backups" className="mt-0">
              <AvailableBackupsTab onRefreshData={onRefreshData} />
            </TabsContent>
            
            <TabsContent value="restore" className="mt-0">
              <RestoreBackupTab
                uploadedFile={uploadedFile}
                onFileChange={handleFileChange}
                onRestoreClick={handleRestoreBackup}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <ConfirmRestoreDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        file={uploadedFile}
        onRestoreComplete={handleRestoreComplete}
      />
    </>
  );
};

export default BackupRestoreDialog;
