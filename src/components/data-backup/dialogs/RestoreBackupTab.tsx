
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileJson, Upload } from 'lucide-react';

interface RestoreBackupTabProps {
  uploadedFile: File | null;
  onFileChange: (file: File | null) => void;
  onRestoreClick: () => void;
}

const RestoreBackupTab: React.FC<RestoreBackupTabProps> = ({ 
  uploadedFile, 
  onFileChange, 
  onRestoreClick 
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/json') {
        // Show error
        onFileChange(null);
        return;
      }
      onFileChange(file);
    }
  };
  
  // Check if filename includes "complete" to indicate enhanced backup
  const isCompleteBackup = (filename: string) => {
    return filename.toLowerCase().includes('complete');
  };
  
  return (
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
          onClick={onRestoreClick}
          disabled={!uploadedFile}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Restore Backup
        </Button>
      </div>
    </div>
  );
};

export default RestoreBackupTab;
