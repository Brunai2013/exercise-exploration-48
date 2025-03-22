
import React from 'react';
import { InfoIcon } from "lucide-react";

interface InfoSectionProps {
  avgWorkoutsPerPeriod: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({ avgWorkoutsPerPeriod }) => {
  return (
    <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <h4 className="font-medium flex items-center text-sm">
        <InfoIcon className="h-4 w-4 mr-1.5 text-blue-500" />
        Understanding Your Workout Consistency
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        This chart shows your workout frequency over time. 
        {avgWorkoutsPerPeriod < 2 
          ? " Try to increase your consistency for better results." 
          : " You're maintaining good consistency!"
        }
      </p>
    </div>
  );
};

export default InfoSection;
