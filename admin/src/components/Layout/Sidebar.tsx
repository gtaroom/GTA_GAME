import {
  LayoutDashboard,
  LogOut,
  Mail,
  Trophy,
  Users,
  Wallet,
  X,
  DollarSign,
  Banknote,
  GiftIcon,
  UserPlus,
  Shield,
  Settings,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Megaphone,
  FileText,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { logOut } from "../../redux/slices/AuthSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../../context/ToastContext";
import { baseUserApi } from "../../services/api/baseUserApi";
import LoadingSpinner from "../UI/LoadingSpinner";
import { getAccessibleRoutes } from "../../config/routeConfig";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { isLoading, getUserPermissions, user } = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    marketing: false,
  });

  // Get user's permissions and accessible routes
  const userPermissions = getUserPermissions();
  const accessibleRoutes = getAccessibleRoutes(userPermissions, user?.role);

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/v1/user/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Clear Redux state
        dispatch(logOut());

        // Invalidate all cached data
        dispatch(baseUserApi.util.resetApiState());

        // Show success message
        showToast("Logged out successfully", "success");

        // Navigate to login
        navigate("/login");
      } else {
        showToast("Logout failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Network error during logout", "error");

      // Still clear local state and redirect
      dispatch(logOut());
      dispatch(baseUserApi.util.resetApiState());
      navigate("/login");
    }
  };

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Show loading spinner while user data is being fetched
  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 h-full bg-gray-800 text-white w-64 flex items-center justify-center">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  // Icon mapping for routes
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      BarChart3: <LayoutDashboard className="mr-3" size={20} />,
      Users: <Users className="mr-3" size={20} />,
      Shield: <Shield className="mr-3" size={20} />,
      Wallet: <Wallet className="mr-3" size={20} />,
      ArrowUpRight: <DollarSign className="mr-3" size={20} />,
      ArrowDownLeft: <Banknote className="mr-3" size={20} />,
      Trophy: <Trophy className="mr-3" size={20} />,
      Gamepad2: <UserPlus className="mr-3" size={20} />,
      Mail: <Mail className="mr-3" size={20} />,
      Tag: <GiftIcon className="mr-3" size={20} />,
      MessageSquare: <MessageSquare className="mr-3" size={20} />,
      Megaphone: <Megaphone className="mr-3" size={20} />,
      FileText: <FileText className="mr-3" size={20} />,
    };
    return iconMap[iconName] || <Settings className="mr-3" size={20} />;
  };

  // Marketing submenu items
  const marketingItems = [
    { path: "/email-marketing", title: "Email Marketing", icon: "Mail" },
    { path: "/sms-marketing", title: "SMS Marketing", icon: "MessageSquare" },
  ];

  return (
    <>
      {/* Sidebar Overlay (for mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0 md:h-screen md:translate-x-0 flex flex-col overflow-hidden`}
      >
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <LayoutDashboard className="mr-2" size={24} />
            Admin Panel
          </h1>
          {/* Close button for mobile */}
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={24} className="text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {/* Dynamically generate navigation items based on user permissions */}
            {accessibleRoutes.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                  title={route.description}
                >
                  {getIcon(route.icon || "Settings")}
                  {route.title}
                </NavLink>
              </li>
            ))}

            {/* Marketing Menu with Submenu */}
            <li>
              <button
                onClick={() => toggleMenu("marketing")}
                className="flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Megaphone className="mr-3" size={20} />
                  Marketing
                </div>
                {openMenus.marketing ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {/* Submenu */}
              {openMenus.marketing && (
                <ul className="ml-6 mt-2 space-y-1">
                  {marketingItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center p-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`
                        }
                      >
                        {getIcon(item.icon)}
                        {item.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Legal Documents - Standalone */}
            <li>
              <NavLink
                to="/legal-documents"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`
                }
              >
                <FileText className="mr-3" size={20} />
                Legal Documents
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
    