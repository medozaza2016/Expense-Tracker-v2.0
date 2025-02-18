import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  Users, 
  LogOut, 
  Settings, 
  X,
  Car,
  ChevronDown,
  History,
  BarChart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CompanyLogo } from './CompanyLogo';
import { supabase } from '../../services/supabase';

interface NavbarProps {
  onClose?: () => void;
}

export function Navbar({ onClose }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vehicles', icon: Car, label: 'Vehicles' },
    {
      label: 'Transactions',
      icon: Receipt,
      children: [
        { to: '/transactions', label: 'All Transactions' },
        { to: '/categories', label: 'Categories', icon: Tags }
      ]
    },
    { to: '/analytics', icon: BarChart, label: 'Business Analytics' }
  ];

  const settingsItems = [
    { to: '/settings', label: 'General Settings', icon: Settings },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/settings/audit', label: 'Audit Logs', icon: History }
  ];

  // Get display name from user profile
  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User';

  // Get the avatar URL from Supabase storage
  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    
    // If it's already a full URL, return it
    if (user.avatar_url.startsWith('http')) {
      return user.avatar_url;
    }
    
    // Otherwise, get the public URL from Supabase storage
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(user.avatar_url);
      
    return publicUrl;
  };

  const avatarUrl = getAvatarUrl();

  // Check if current path is under settings
  const isSettingsPath = location.pathname.startsWith('/settings') || location.pathname === '/users';
  // Check if current path is under transactions
  const isTransactionsPath = location.pathname === '/transactions' || location.pathname === '/categories';

  return (
    <nav className="flex flex-col h-full bg-card border-r border-gray-800">
      <div className="p-6 flex items-center justify-between">
        <CompanyLogo />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-background/50 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        )}
      </div>

      <div className="flex-1 px-3 overflow-y-auto">
        {/* Main Navigation Items */}
        {navItems.map((item, index) => (
          'children' in item ? (
            <div key={index}>
              <button
                onClick={() => setIsTransactionsOpen(!isTransactionsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 my-1 rounded-lg transition-colors ${
                  isTransactionsPath 
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-card/60 hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isTransactionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTransactionsOpen && (
                <div className="ml-4 pl-4 border-l border-gray-800">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-secondary hover:bg-card/60 hover:text-text-primary'
                        }`
                      }
                    >
                      {child.icon && <child.icon className="w-5 h-5" />}
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-card/60 hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        ))}

        {/* Settings Section */}
        <div className="mt-4">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center justify-between w-full px-4 py-3 my-1 rounded-lg transition-colors ${
              isSettingsPath
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:bg-card/60 hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSettingsOpen && (
            <div className="ml-4 pl-4 border-l border-gray-800">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-card/60 hover:text-text-primary'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-medium">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-xs text-text-secondary truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
