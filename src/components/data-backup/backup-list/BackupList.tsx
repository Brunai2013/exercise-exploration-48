
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import BackupItem from './BackupItem';

interface BackupListProps {
  backups: { name: string; path: string; created_at: string }[];
  onDownload: (path: string) => Promise<void>;
}

const BackupList: React.FC<BackupListProps> = ({ backups, onDownload }) => {
  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="divide-y">
        {backups.map((backup) => (
          <BackupItem 
            key={backup.path} 
            backup={backup} 
            onDownload={onDownload} 
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default BackupList;
