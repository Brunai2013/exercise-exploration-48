
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Database, Save, UploadCloud, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { createExerciseBackup, listExerciseBackups, downloadExerciseBackup, restoreFromBackup } from '@/lib/backup';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useExerciseData } from '@/hooks/useExerciseData';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const DataBackup = () => {
  const [backups, setBackups] = useState<{ name: string; path: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { refreshAllData } = useExerciseData();
  
  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupsList = await listExerciseBackups();
      setBackups(backupsList);
      toast.success('Backup list loaded successfully');
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
      const backupPath = await createExerciseBackup();
      if (backupPath) {
        toast.success('Backup created successfully');
        await loadBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsLoading(false);
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
        refreshAllData();
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
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Load backups when component mounts
  React.useEffect(() => {
    loadBackups();
  }, []);
  
  return (
    <PageContainer>
      <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md text-white mb-4">
          <Database className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          Database Backup & Restore
        </h1>
        <p className="text-muted-foreground mt-2">
          Create backups of your exercise data or restore from a previous backup
        </p>
      </div>
      
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          This backup system creates a copy of your exercise library data (exercises and categories) in Supabase storage.
          It's recommended to create a backup before making significant changes to your database.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-2">
          <TabsTrigger value="backups">Manage Backups</TabsTrigger>
          <TabsTrigger value="restore">Restore Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="backups" className="space-y-6">
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
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={loadBackups}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={handleCreateBackup}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create New Backup
                </Button>
              </div>
              
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary/70 mb-2" />
                  <p>Loading backups...</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border rounded-md bg-slate-50">
                  <Database className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-lg font-medium text-slate-500 mb-1">No backups found</p>
                  <p className="text-sm">Create your first backup using the button above.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="divide-y">
                    {backups.map((backup) => (
                      <div 
                        key={backup.path} 
                        className="flex justify-between items-center p-4 hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium truncate max-w-[300px]">{backup.name}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(backup.created_at)}</p>
                        </div>
                        <Button
                          variant="outline"
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="restore" className="space-y-6">
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
                  Restoring from a backup will merge the backup data with your existing exercises and categories.
                  Any conflicts will be resolved by keeping the backup version. This operation cannot be undone.
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {uploadedFile.name}
                    </p>
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
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Restore Operation</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge the backup data with your existing exercises and categories.
              Any conflicts will be resolved by keeping the backup version.
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
    </PageContainer>
  );
};

export default DataBackup;
