import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  Settings,
  ShoppingBag,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/users', label: 'Users', icon: Users },
          { path: '/stores', label: 'Stores', icon: Store },
          { path: '/settings', label: 'Settings', icon: Settings },
        ];
      case 'user':
        return [
          { path: '/stores', label: 'Browse Stores', icon: ShoppingBag },
          { path: '/my-ratings', label: 'My Ratings', icon: Star },
          { path: '/settings', label: 'Settings', icon: Settings },
        ];
      case 'store_owner':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/my-stores', label: 'My Stores', icon: Store },
          { path: '/settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 w-64 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
