
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, 
  Dumbbell, 
  Calendar as CalendarIcon,
  ChartBarIcon,
  Database,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AppNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Primary navigation items (high priority)
  const primaryNavItems = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarIcon className="h-4 w-4 mr-2" /> },
    { href: '/exercise-library', label: 'Exercise Library', icon: <Dumbbell className="h-4 w-4 mr-2" /> },
  ];

  // Secondary navigation items (lower priority)
  const secondaryNavItems = [
    { href: '/workout-metrics', label: 'Analytics', icon: <ChartBarIcon className="h-4 w-4 mr-2" /> },
    { href: '/backup', label: 'Backup & Restore', icon: <Database className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex-1 flex justify-end">
      <nav className="flex items-center space-x-1.5">
        {/* Primary Nav Items */}
        {primaryNavItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant={isActive(item.href) ? "default" : "ghost"}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm",
                isActive(item.href) 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive(item.href) && <Sparkles className="h-3 w-3 ml-2 text-white/70" />}
            </Button>
          </Link>
        ))}

        {/* Secondary Nav Items */}
        {secondaryNavItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant={isActive(item.href) ? "default" : "ghost"}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm",
                isActive(item.href) 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive(item.href) && <Sparkles className="h-3 w-3 ml-2 text-white/70" />}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AppNavigation;
