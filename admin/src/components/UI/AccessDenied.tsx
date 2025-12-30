import { Lock, Shield } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

interface AccessDeniedProps {
  requiredRole?: string;
  feature?: string;
  showBackButton?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  requiredRole = "ADMIN", 
  feature = "this feature",
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const { userRole } = usePermissions();

  const getRoleLabel = (role: string) => {
    if (role === "ADMIN") return "Administrator";
    if (role === "MANAGEMENT") return "Management";
    if (role === "SUPPORT_LEAD") return "Support Lead";
    if (role === "SUPPORT_TEAM") return "Support Team";
    if (role === "ANALYST") return "Analyst";
    if (role === "MODERATOR") return "Moderator";
    if (role === "GAME_MANAGER") return "Game Manager";
    if (role === "FINANCE_MANAGER") return "Finance Manager";
    if (role === "CONTENT_MODERATOR") return "Content Moderator";
    return role;
  };

  const handleGoBack = () => {
    if (userRole === "MANAGER") {
      navigate('/coupons');
    } else {
      window.location.href=(import.meta.env.VITE_APP_API_URL || '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Shield className="h-8 w-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            You don't have permission to access {feature}. This feature requires{' '}
            <span className="font-semibold text-red-600">
              {getRoleLabel(requiredRole)}
            </span>{' '}
            privileges.
          </p>

          {/* Current Role Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Lock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Your Current Role:</span>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {userRole ? getRoleLabel(userRole) : 'Unknown'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            )}
            
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need access? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 