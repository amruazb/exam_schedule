import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  CalendarDays, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './utils.js';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Calendar View', href: '/calendar', icon: CalendarDays },
  { name: 'Admin Panel', href: '/admin', icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Exam Proctoring System</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <div className={cn(
          "lg:w-64 lg:flex-shrink-0",
          mobileMenuOpen ? "block" : "hidden lg:block"
        )}>
          <div className="flex flex-col h-full lg:h-screen bg-card border-r">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b">
              <h1 className="text-xl font-bold text-foreground">
                Exam Proctoring System
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t">
              <p className="text-xs text-muted-foreground">
                Built with React & Tailwind CSS
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:max-w-none">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

