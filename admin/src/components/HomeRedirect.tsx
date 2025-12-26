import { Navigate, useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import MainLayout from "../components/Layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { useEffect } from "react";

export const HomeRedirect = () => {
  const { user, isLoading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // If they are a Designer, push them to Banners
      if ((user.role as string) === "DESIGNER") {
        navigate("/banner-management", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <LoadingSpinner />;

  // Admins see the Dashboard, Designers get redirected by the useEffect above
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};
