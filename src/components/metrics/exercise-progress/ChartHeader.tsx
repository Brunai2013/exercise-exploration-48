
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ChartHeaderProps {
  title: string;
  description: string;
  infoText: string;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, description, infoText }) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">
            {description}
          </CardDescription>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">How to Use This Chart</h4>
              <p className="text-sm">{infoText}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </CardHeader>
  );
};

export default ChartHeader;
