
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { createExerciseBackup, listExerciseBackups, downloadExerciseBackup, restoreFromBackup, downloadLocalBackup } from '@/lib/backup';
import { Download, Upload, Save, RefreshCw, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const [backups, setBackups] = useState<{ name: string; path: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Fetch backups when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);
  
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadBackup = async (path: string) => {
    await downloadExerciseBackup(path);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/json') {
        toast.error('Please select a JSON file');
        return;
      }
      setUploadedFile(file);
    }
  };
  
  const handleRestoreBackup = async () => {
    if (!uploadedFile) {
      toast.error('Please select a backup file first');
      return;
    }
    
    setConfirmDialogOpen(true);
  };
  
  const confirmRestore = async () => {
    setConfirmDialogOpen(false);
    if (!uploadedFile) return;
    
    setIsRestoring(true);
    try {
      const success = await restoreFromBackup(uploadedFile);
      if (success) {
        toast.success('Backup restored successfully');
        onRefreshData();
        onOpenChange(false);
      }
    } finally {
      setIsRestoring(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Detect if filename includes "complete" to indicate enhanced backup
  const isCompleteBackup = (filename: string) => {
    return filename.toLowerCase().includes('complete');
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Backup Files</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadBackups}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleCreateBackup}
                    disabled={isLoading}
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
                          <p className="text-sm text-muted-foreground">{formatDate(backup.created_at)}</p>
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
            </TabsContent>
            
            <TabsContent value="restore" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Restore from Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Warning: Restoring from a backup will merge the backup data with your existing database.
                    For complete backups, this includes your exercise library, workout history, and performance data.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">Select backup file</p>
                    <Input 
                      type="file" 
                      accept=".json" 
                      onChange={handleFileChange}
                      disabled={isRestoring}
                    />
                    {uploadedFile && (
                      <div className="flex items-center mt-2">
                        <FileJson className="h-4 w-4 mr-1 text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                          Selected: {uploadedFile.name}
                        </p>
                        {uploadedFile.name.toLowerCase().includes('complete') && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            Complete
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleRestoreBackup}
                    disabled={!uploadedFile || isRestoring}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isRestoring ? 'Restoring...' : 'Restore Backup'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Restore</AlertDialogTitle>
            <AlertDialogDescription>
              {uploadedFile?.name.toLowerCase().includes('complete') ? (
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
            <AlertDialogAction onClick={confirmRestore}>Proceed with Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackupRestoreDialog;
