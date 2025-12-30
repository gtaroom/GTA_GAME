import React, { ReactNode, useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../services/api/authApi";
import { NotificationProvider } from "../../context/NotificationContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoading, data: user, error } = useGetUserDetailsQuery();

  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <>
      <NotificationProvider userId={user?._id || ""} role={user?.role || ""}>
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <div
            className={`fixed md:relative md:w-64 ${
              isOpen ? "w-64" : "w-0"
            } transition-all duration-300 z-50 `}
          >
            <button
              className={`md:hidden fixed top-5 left-4 z-50 text-gray-600  ${
                !isOpen ? "" : "hidden"
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={24} />
            </button>
            <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />

            <main className="flex-1 p-6 overflow-auto">{children}</main>
            <footer className="py-4 px-6 text-center text-sm text-gray-600 border-t">
              &copy; {new Date().getFullYear()} Admin Dashboard. All rights
              reserved.
            </footer>
          </div>
        </div>
      </NotificationProvider>
    </>
  );
};

export default MainLayout;
