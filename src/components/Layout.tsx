import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, BarChart3, Plus, Home, Settings, Bell, BookOpen, BookText } from 'lucide-react';
import { storage } from '../utils/storage';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const brandSettings = storage.getBrandSettings();
  
  // Get notifications for admin
  const notifications = JSON.parse(localStorage.getItem('formora_notifications') || '[]');
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--primary-color': brandSettings.primaryColor } as any}>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <Link to="/home" className="flex items-center space-x-2">
                {brandSettings.logoUrl ? (
                  <img src={brandSettings.logoUrl} alt={brandSettings.brandName} className="h-8 w-8" />
                ) : (
                  <ClipboardList className="h-8 w-8" style={{ color: brandSettings.primaryColor }} />
                )}
                <span className="text-xl font-bold text-gray-900 truncate">{brandSettings.brandName}</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/home"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/home')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/home') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/create"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/create') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Link>
              
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/dashboard') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/library"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/library')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/library') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <BookOpen className="h-4 w-4" />
                <span>Library</span>
              </Link>
              
              <Link
                to="/guide"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/guide')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/guide') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <BookText className="h-4 w-4" />
                <span>Guide</span>
              </Link>
              
              <Link
                to="/admin/users"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/settings') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <Users className="h-4 w-4" />
                <span>Team</span>
              </Link>
              
              <Link
                to="/settings"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive('/settings') ? { backgroundColor: brandSettings.primaryColor } : {}}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              
              {/* Notifications */}
              <div className="relative">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-2">
              <Link
                to="/create"
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
      
      {brandSettings.showPoweredBy && (
        <footer className="bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-medium">Formora</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;