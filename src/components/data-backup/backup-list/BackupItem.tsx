
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isCompleteBackup, formatBackupDate } from '@/lib/backup';

interface BackupItemProps {
  backup: { name: string; path: string; created_at: string };
  onDownload: (path: string) => void;
}

const BackupItem: React.FC<BackupItemProps> = ({ backup, onDownload }) => {
  return (
    <div 
      className="flex justify-between items-center p-4 hover:bg-slate-50"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium truncate max-w-[300px]">{backup.name}</p>
          {isCompleteBackup(backup.name) && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Complete
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{formatBackupDate(backup.created_at)}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDownload(backup.path)}
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  );
};

export default BackupItem;
