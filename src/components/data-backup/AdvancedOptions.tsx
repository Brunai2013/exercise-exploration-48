
import React from 'react';
import { Shield, HardDrive, FileJson, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { downloadDatabaseSchema } from '@/lib/backup';

const AdvancedOptions: React.FC = () => {
  const handleDownloadSchema = async () => {
    try {
      await downloadDatabaseSchema();
    } catch (error) {
      console.error('Error downloading schema:', error);
      toast.error('Failed to download database schema');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Advanced Backup Options
        </CardTitle>
        <CardDescription>
          Additional tools for advanced database management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md border p-4">
            <h3 className="text-md font-medium flex items-center">
              <HardDrive className="h-4 w-4 mr-2 text-blue-600" />
              Database Schema Backup
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Download the database schema definition for advanced restoration scenarios.
              This includes table structures, relationships, and indexes.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadSchema}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Download Schema Definition
            </Button>
          </div>
          
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>About Database Restoration</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Complete backups contain all your app data and can be used to restore your database in case of:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Accidental data deletion</li>
                <li>Database schema changes that cause issues</li>
                <li>Transferring data to a new database instance</li>
              </ul>
              <p className="mt-2">
                For technical assistance with database restoration, please contact support.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedOptions;
