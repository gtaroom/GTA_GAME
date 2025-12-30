import { Outlet, Navigate } from "react-router-dom";
import { useGetUserDetailsQuery } from "./services/api/authApi";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import AccessDenied from "./components/UI/AccessDenied";

const PrivateRoute = () => {
  const { isLoading, data: user, error } = useGetUserDetailsQuery();

  // Check if we have tokens in cookies
  const hasTokens =
    document.cookie.includes("accessToken") ||
    document.cookie.includes("refreshToken");

  // Still loading? Show spinner
  if (isLoading) {
    return (
      <LoadingSpinner
        size="lg"
        text="Checking authentication..."
        className="min-h-screen"
      />
    );
  }

  // Got a 401 error and no tokens? Redirect to login
  if (
    error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status === 401 &&
    !hasTokens
  ) {
    console.log("401 error and no tokens - Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // No user data after loading? Redirect to login
  if (!user && !isLoading) {
    console.log("No user found after loading - Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user has a valid admin role (not "USER")
  if (user && user.role === "USER") {
    console.log("User role is USER - Access denied to admin panel");
    return (
      <AccessDenied
        requiredRole="Admin role"
        feature="the admin dashboard"
        showBackButton={false}
      />
    );
  }

  // User exists with valid role - allow access
  return <Outlet />;
};

export default PrivateRoute;
