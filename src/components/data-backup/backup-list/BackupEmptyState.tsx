
import React from 'react';
import { Database } from 'lucide-react';

const BackupEmptyState: React.FC = () => {
  return (
    <div className="py-12 text-center text-muted-foreground border rounded-md bg-slate-50">
      <Database className="h-12 w-12 mx-auto text-slate-300 mb-2" />
      <p className="text-lg font-medium text-slate-500 mb-1">No backups found</p>
      <p className="text-sm">Create your first backup using the button above.</p>
    </div>
  );
};

export default BackupEmptyState;
