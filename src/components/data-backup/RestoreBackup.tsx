
import React, { useState } from 'react';
import { UploadCloud, AlertCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { toast } from 'sonner';
import { restoreFromBackup } from '@/lib/backup';

interface RestoreBackupProps {
  onRestoreComplete: () => void;
}

const RestoreBackup: React.FC<RestoreBackupProps> = ({ onRestoreComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/json') {
        toast.error('Please select a JSON file');
        return;
      }
      setUploadedFile(file);
      toast.info(`File selected: ${file.name}`);
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
        onRestoreComplete();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore backup');
    } finally {
      setIsRestoring(false);
      setUploadedFile(null);
      
      // Reset file input by clearing its value
      const fileInput = document.getElementById('backup-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  // Detect if filename includes "complete" to indicate complete backup format
  const isCompleteBackup = (filename: string): boolean => {
    return filename?.toLowerCase().includes('complete') || false;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="mr-2 h-5 w-5 text-primary" />
            Restore from Backup
          </CardTitle>
          <CardDescription>
            Import a previously downloaded backup file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Caution</AlertTitle>
            <AlertDescription>
              <p>Restoring from a backup will merge the backup data with your existing database.</p>
              <p className="mt-1">
                For complete backups, this will restore your entire exercise library, workout history, and performance data.
              </p>
              <p className="mt-1">Any conflicts will be resolved by keeping the backup version. This operation cannot be undone.</p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <p className="text-sm font-medium mb-2">Select backup file</p>
              <Input 
                id="backup-file"
                type="file" 
                accept=".json" 
                onChange={handleFileChange}
                disabled={isRestoring}
              />
              {uploadedFile && (
                <div className="text-sm text-muted-foreground mt-2 flex items-center">
                  <FileJson className="h-4 w-4 mr-1" />
                  <span>Selected: {uploadedFile.name}</span>
                  {isCompleteBackup(uploadedFile.name) && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      Complete Backup
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <Button
              onClick={handleRestoreBackup}
              disabled={!uploadedFile || isRestoring}
              className="w-full"
              variant={!uploadedFile ? "outline" : "default"}
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              {isRestoring ? 'Restoring...' : 'Restore Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Restore Operation</AlertDialogTitle>
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
              </p>
              <Separator className="my-4" />
              <span className="font-medium text-amber-600 block mt-2">This operation cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-red-600 hover:bg-red-700">
              Proceed with Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RestoreBackup;
