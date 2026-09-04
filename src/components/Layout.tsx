import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, Home, Library, Settings, Search, Menu, X, Bookmark, BrainCircuit, ShieldAlert, GraduationCap, UserCog } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../contexts/RoleContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Resources', href: '/resources', icon: Library },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'AI Assistant', href: '/ai-assistant', icon: BrainCircuit },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { session, role, isAdmin, isFaculty, signOut, loading } = useRole();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const filteredNavigation = navigation.filter(item => {
    if (item.name === 'Admin') return isAdmin || isFaculty;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2 text-primary font-semibold text-lg" onClick={() => setSidebarOpen(false)}>
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <span>EduVault</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-700" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-xl">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span>EduVault</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Menu</div>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex flex-col gap-2">
            <button onClick={signOut} className="w-full text-sm py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 font-medium transition-colors border border-gray-200">
              Sign Out
            </button>
          </div>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              <UserCog className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{session?.user?.user_metadata?.full_name || 'User'}</span>
              <span className="text-xs text-gray-500 uppercase">{role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between lg:justify-end px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white shadow-sm z-0 sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 lg:hidden flex justify-center">
            <span className="font-semibold text-lg text-gray-900">EduVault</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, subjects, tags..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
