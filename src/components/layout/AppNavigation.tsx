
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, 
  Dumbbell, 
  Calendar as CalendarIcon,
  ChartBarIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AppNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { href: '/exercise-library', label: 'Exercise Library', icon: <Dumbbell className="h-5 w-5 mr-2" /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarIcon className="h-5 w-5 mr-2" /> },
    { href: '/workout-metrics', label: 'Analytics', icon: <ChartBarIcon className="h-5 w-5 mr-2" /> }
  ];

  return (
    <div className="flex-1 flex justify-end">
      <nav className="flex items-center space-x-1">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant={isActive(item.href) ? "default" : "ghost"}
              className={cn(
                "flex items-center px-4 rounded-full w-[190px]",
                isActive(item.href) 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-indigo-50"
              )}
            >
              {item.icon}
              <span className="flex-1 text-left pl-0">{item.label}</span>
              {isActive(item.href) && <Sparkles className="h-3 w-3 ml-2 text-white/70" />}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AppNavigation;
