
import React from 'react';
import { RefreshCw } from 'lucide-react';

const BackupLoadingState: React.FC = () => {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary/70 mb-2" />
      <p>Loading backups...</p>
    </div>
  );
};

export default BackupLoadingState;
