import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, Settings, UserCircle, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logOut } from '../../redux/slices/AuthSlice';
import { useToast } from '../../context/ToastContext';
import { baseUserApi } from '../../services/api/baseUserApi';
import { NotificationCenter } from '../NotificationCenter';
import { usePermissions } from '../../hooks/usePermissions';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isLoading } = usePermissions();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/v1/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear Redux state
        dispatch(logOut());
        
        // Invalidate all cached data
        dispatch(baseUserApi.util.resetApiState());
        
        // Show success message
        showToast('Logged out successfully', 'success');
        
        // Navigate to login
        navigate('/login');
      } else {
        showToast('Logout failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Network error during logout', 'error');
      
      // Still clear local state and redirect
      dispatch(logOut());
      dispatch(baseUserApi.util.resetApiState());
      navigate('/login');
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;

  const getRoleColor = () => {
    if (!user) return 'text-gray-500';
    
    // Color based on role name - using string comparison for flexibility
    const role = user.role as string;
    if (role === 'ADMIN') return 'text-red-500';
    if (role === 'SENIOR_MANAGER' || role === 'MANAGER') return 'text-purple-500';
    if (role === 'SUPPORT_LEAD') return 'text-blue-500';
    if (role === 'GAME_MANAGER') return 'text-green-500';
    if (role === 'DATA_ANALYST' || role === 'ANALYST') return 'text-yellow-500';
    if (role === 'CONTENT_MODERATOR') return 'text-orange-500';
    if (role === 'FINANCE_MANAGER') return 'text-emerald-500';
    return 'text-indigo-500'; // Default for any custom roles
  };

  const getRoleLabel = () => {
    if (!user) return 'Loading...';
    // Format role name: SENIOR_MANAGER -> Senior Manager
    return user.role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800 md:ml-0 ml-5">
          GTOA
        </h2>
        {/* Role indicator - only show when not loading */}
        {!isLoading && (
          <div className="ml-4 flex items-center">
            <Shield className={`w-4 h-4 mr-1 ${getRoleColor()}`} />
            <span className={`text-sm font-medium ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={18}
          />
        </div>

        <NotificationCenter />
        {/* <div className="relative" ref={notificationsRef}>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <p>{notification.text}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              ))}
            </div>
          )}
        </div> */}

        <div className="relative" ref={menuRef}>
          <button
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 focus:outline-none"
            onClick={toggleMenu}
          >
            <User size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              {/* Role display */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Role</p>
                <p className={`text-sm font-medium ${getRoleColor()}`}>
                  {getRoleLabel()}
                </p>
              </div>
              
              {/* Profile and Settings - available to all admin users */}
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircle className="inline-block mr-2" size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="inline-block mr-2" size={16} />
                    Settings
                  </Link>
                </>
              )}
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="inline-block mr-2" size={16} />
                Logout
              </button>
              <Link
                to={VITE_APP_API_URL}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="inline-block mr-2" size={16} />
                Go Back
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
