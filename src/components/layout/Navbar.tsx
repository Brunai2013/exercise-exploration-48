
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar, 
  BarChart3,
  Database,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Main navigation items that appear in the top bar
  const primaryNavItems = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
    { href: '/exercise-library', label: 'Library', icon: <Dumbbell className="h-5 w-5" /> },
  ];

  // All navigation items including those in the dropdown
  const allNavItems = [
    ...primaryNavItems,
    { href: '/workout-metrics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { href: '/backup', label: 'Backup & Restore', icon: <Database className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold text-purple-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span>FitTrack</span>
        </Link>
        
        {/* Main Navigation */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Primary Nav Items - Fixed size and position */}
          {primaryNavItems.map((item) => (
            <Link 
              key={item.href} 
              to={item.href}
              className={cn(
                "flex h-10 w-[110px] items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-purple-600 text-white" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
              style={{ transition: 'background-color 0.2s ease', width: '110px' }}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
          
          {/* Side Menu - Fixed size and position */}
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Menu"
                style={{ width: '40px', height: '40px' }}
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[250px] sm:w-[300px]">
              <nav className="mt-8 flex flex-col gap-2">
                {allNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-purple-100 text-purple-700" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
