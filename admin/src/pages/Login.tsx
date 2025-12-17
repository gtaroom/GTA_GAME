import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userData } from '../redux/slices/AuthSlice';
import { useToast } from '../context/ToastContext';
import { RootState } from '../redux/store';
import { baseUserApi } from '../services/api/baseUserApi';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AccessDenied from '../components/UI/AccessDenied';
import { useGetUserDetailsQuery } from '../services/api/authApi';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      name: {
        first: string;
        middle?: string;
        last: string;
      };
      email: string;
      role: string;
    };
    accessToken: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { data: user, isLoading: userLoading } = useGetUserDetailsQuery();
  
  // Redirect if already logged in with valid user
  useEffect(() => {
    // Only redirect if we have a user and they're not a regular USER
    if (user && user.role !== "USER" && !userLoading) {
      // Don't redirect if we're already on login (prevents loop)
      if (location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    }
  }, [user, userLoading, navigate, location.pathname]);
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [accessDenied, setAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAccessDenied(false);

    try {
      // Invalidate any existing cache before login
      dispatch(baseUserApi.util.resetApiState());
      console.log("Logging in with:", formData);
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/v1/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      console.log("Logging in with:.................", formData);

      const data: LoginResponse = await response.json();

      if (response.ok && data.success) {
        // Check if user has valid role (not "USER")
        const userRole = data.data!.user.role;
        
        if (userRole !== "USER") {
          // Store user data in Redux
          dispatch(userData(data.data!.user));

          // Show success toast
          showToast('Login successful! Redirecting...', 'success');
          
          // Navigate immediately - let the app handle permission-based routing
          navigate('/');
        } else {
          // User role is "USER" - not allowed in admin panel
          setAccessDenied(true);
          setUserRole(userRole);
          showToast('Access denied. Admin privileges required.', 'error');
        }
      } else {
        // Show error message
        showToast(data.message || "Login failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast(
        "Network error. Please check your connection and try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show access denied if user has unauthorized role
  if (accessDenied) {
    return (
      <AccessDenied
        requiredRole="ADMIN"
        feature="the admin dashboard"
        showBackButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">Sign in to your admin account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? <LoadingSpinner size="sm" text="" /> : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href={`${import.meta.env.VITE_APP_API_URL}`}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Contact Administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
