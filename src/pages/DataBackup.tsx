
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExerciseData } from '@/hooks/useExerciseData';
import { listExerciseBackups } from '@/lib/backup';

// Import our newly created components
import BackupHeader from '@/components/data-backup/BackupHeader';
import BackupsList from '@/components/data-backup/BackupsList';
import RestoreBackup from '@/components/data-backup/RestoreBackup';
import AdvancedOptions from '@/components/data-backup/AdvancedOptions';

const DataBackup = () => {
  const [backups, setBackups] = useState<{ name: string; path: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAllData } = useExerciseData();
  
  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupsList = await listExerciseBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestoreComplete = () => {
    refreshAllData();
  };
  
  // Load backups when component mounts
  useEffect(() => {
    loadBackups();
  }, []);
  
  return (
    <PageContainer>
      {/* Header Section */}
      <BackupHeader />
      
      {/* Main Tabs */}
      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-3">
          <TabsTrigger value="backups">Manage Backups</TabsTrigger>
          <TabsTrigger value="restore">Restore Data</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="backups" className="space-y-6">
          <BackupsList 
            backups={backups} 
            isLoading={isLoading} 
            onBackupCreated={loadBackups} 
          />
        </TabsContent>
        
        <TabsContent value="restore" className="space-y-6">
          <RestoreBackup onRestoreComplete={handleRestoreComplete} />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedOptions />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default DataBackup;
