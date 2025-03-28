
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar as CalendarIcon, 
  ChartBarIcon,
  Database,
  Menu,
  X,
  Sparkles,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // High priority navigation items - always visible
  const primaryNavItems = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-1.5" /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarIcon className="h-4 w-4 mr-1.5" /> },
    { href: '/exercise-library', label: 'Exercise', icon: <Dumbbell className="h-4 w-4 mr-1.5" /> },
  ];

  // Secondary items for dropdown menu
  const secondaryNavItems = [
    { href: '/workout-metrics', label: 'Analytics', icon: <ChartBarIcon className="h-4 w-4 mr-2" /> },
    { href: '/backup', label: 'Backup & Restore', icon: <Database className="h-4 w-4 mr-2" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 w-full shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded-full text-white shadow-sm mr-2">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">FitTrack</span> <Sparkles className="h-3.5 w-3.5 ml-1 text-indigo-400" />
        </Link>

        {/* Primary Navigation - Always visible, smaller on mobile */}
        <div className="flex items-center ml-auto mr-1 md:mr-2 space-x-1 md:space-x-2">
          {primaryNavItems.map((item) => (
            <Link key={item.href} to={item.href} className="shrink-0">
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-2 sm:px-3 rounded-md transition-all duration-300 flex items-center",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.icon}
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                {isActive(item.href) && <Sparkles className="h-3 w-3 ml-1 text-white/70" />}
              </Button>
            </Link>
          ))}

          {/* Secondary Navigation - More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              {secondaryNavItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link 
                    to={item.href} 
                    className={cn(
                      "flex items-center py-1.5 cursor-pointer",
                      isActive(item.href) && "bg-slate-100 text-indigo-600"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive(item.href) && <Sparkles className="h-3 w-3 ml-2 text-indigo-400" />}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden h-9 px-2 rounded-md hover:bg-slate-100" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in fixed inset-0 top-16 bg-white/95 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4 pt-4 pb-8">
            <nav className="flex flex-col space-y-1">
              {/* Main nav items */}
              {primaryNavItems.map((item) => (
                <Link key={item.href} to={item.href} className="w-full">
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-base py-3 rounded-lg",
                      isActive(item.href) 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left pl-0">{item.label}</span>
                    {isActive(item.href) && <Sparkles className="h-3.5 w-3.5 ml-2 text-white/70" />}
                  </Button>
                </Link>
              ))}
              
              {/* Secondary nav items */}
              {secondaryNavItems.map((item) => (
                <Link key={item.href} to={item.href} className="w-full">
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-base py-3 rounded-lg",
                      isActive(item.href) 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left pl-0">{item.label}</span>
                    {isActive(item.href) && <Sparkles className="h-3.5 w-3.5 ml-2 text-white/70" />}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
