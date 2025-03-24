
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Loader2 } from 'lucide-react';

const WorkoutLoadingState: React.FC = () => {
  return (
    <PageContainer>
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p className="text-lg">Loading workout session...</p>
      </div>
    </PageContainer>
  );
};

export default WorkoutLoadingState;
