
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { href: '/exercise-library', label: 'Exercise Library', icon: <Dumbbell className="h-5 w-5 mr-2" /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarIcon className="h-5 w-5 mr-2" /> },
  ];

  return (
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

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-end">
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "flex items-center justify-start px-4 rounded-full w-[160px]",
                    location.pathname === item.href 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow" 
                      : "text-muted-foreground hover:text-foreground hover:bg-indigo-50"
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-center">{item.label}</span>
                  {location.pathname === item.href && <Sparkles className="h-3 w-3 ml-2 text-white/70" />}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Nav Toggle */}
        <Button 
          variant="ghost" 
          className="md:hidden p-1 rounded-full hover:bg-indigo-50" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5 text-indigo-600" /> : <Menu className="h-5 w-5 text-indigo-600" />}
        </Button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in fixed inset-0 top-16 bg-white/95 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4 pt-4 pb-8">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} className="w-full">
                  <Button
                    variant={location.pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-lg py-6 rounded-xl",
                      location.pathname === item.href 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-indigo-50"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-center">{item.label}</span>
                    {location.pathname === item.href && <Sparkles className="h-3.5 w-3.5 ml-2 text-white/70" />}
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
