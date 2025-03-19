
import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Sparkles } from "lucide-react";
import AppNavigation from "./AppNavigation";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => {
  return (
    <div className="animate-fade-in font-inter">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded-full text-white shadow-glow mr-2">
              <Dumbbell className="h-5 w-5" />
            </div>
            FitTrack <Sparkles className="h-4 w-4 ml-1 text-indigo-400" />
          </Link>
          <div className="flex-1 flex justify-end">
            <AppNavigation />
          </div>
        </div>
      </header>
      
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
