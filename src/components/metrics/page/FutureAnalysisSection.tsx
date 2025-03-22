
import React from 'react';
import UpcomingAnalysis from '@/components/metrics/UpcomingAnalysis';
import { CategoryAnalysis } from "@/hooks/metrics/useMetricsData";

interface FutureAnalysisSectionProps {
  data: CategoryAnalysis[];
  isLoading: boolean;
}

const FutureAnalysisSection: React.FC<FutureAnalysisSectionProps> = ({ data, isLoading }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Future Workout Analysis</h2>
      <UpcomingAnalysis data={data} isLoading={isLoading} />
    </div>
  );
};

export default FutureAnalysisSection;
