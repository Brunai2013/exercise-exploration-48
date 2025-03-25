
import React from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BackupHeader: React.FC = () => {
  return (
    <>
      <div className="mb-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-2xl shadow-md border border-blue-100">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md text-white mb-4">
          <Database className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          Database Backup & Restore
        </h1>
        <p className="text-muted-foreground mt-2">
          Create comprehensive backups of all your data or restore from a previous backup
        </p>
      </div>
      
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          <p>The enhanced backup system creates a complete copy of your data including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Exercise library (exercises and categories)</li>
            <li>Workout history (completed and planned workouts)</li>
            <li>Exercise sets and performance data</li>
          </ul>
          <p className="mt-2">
            Backups are stored both in Supabase storage and can be downloaded locally as a failsafe.
          </p>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default BackupHeader;
