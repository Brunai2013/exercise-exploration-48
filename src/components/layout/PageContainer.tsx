import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Sparkles } from "lucide-react";
import AppNavigation from "./AppNavigation";
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = ""
}) => {
  return <div className="animate-fade-in font-inter">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full shadow-sm">
        
      </header>
      
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        {children}
      </div>
    </div>;
};
export default PageContainer;