
import React from 'react';
import { InfoIcon, AlertCircle, CheckCircle2 } from "lucide-react";

interface InfoSectionProps {
  avgWorkoutsPerPeriod: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({ avgWorkoutsPerPeriod }) => {
  const isConsistencyGood = avgWorkoutsPerPeriod >= 2;
  
  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      <h4 className="font-medium flex items-center text-gray-800 mb-2">
        <InfoIcon className="h-5 w-5 mr-2 text-blue-600" />
        Understanding Your Workout Consistency
      </h4>
      
      <div className="flex items-start mt-3 bg-gray-50 p-3 rounded-md">
        {isConsistencyGood ? (
          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">
              {isConsistencyGood ? "Good consistency!" : "Room for improvement"}
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {isConsistencyGood 
              ? "You're maintaining good workout frequency. Keep up the great work for continued progress!" 
              : "Try to increase your workout frequency to at least 2-3 times per week for better results."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
