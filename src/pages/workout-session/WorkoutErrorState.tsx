
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';

interface WorkoutErrorStateProps {
  error: string | null;
}

const WorkoutErrorState: React.FC<WorkoutErrorStateProps> = ({ error }) => {
  return (
    <PageContainer>
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Workout Not Found</h2>
        <p className="mb-6">{error || "The workout you're looking for doesn't exist."}</p>
      </div>
    </PageContainer>
  );
};

export default WorkoutErrorState;
