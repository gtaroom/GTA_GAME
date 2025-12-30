import { GamepadIcon, TrendingUp, UserCheck, Users } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/UI/Card";
import {
  useGetRegistrationTrendQuery,
  useGetStatsQuery,
  useGetUsersMetricsQuery,
} from "../services/api/dashboardApi";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Dashboard: React.FC = () => {
  const { showToast } = useToast();
  const { isLoading, error, data: dashboardStats } = useGetStatsQuery();
  const {
    isLoading: regLoading,
    error: regError,
    data: registrationTrend,
  } = useGetRegistrationTrendQuery();
  const {
    isLoading: engLoading,
    error: engError,
    data: engagementMetrics,
  } = useGetUsersMetricsQuery();

  // Handle errors from API calls
  React.useEffect(() => {
    if (error) {
      const errorMessage =
        (error as any)?.data?.message || "Failed to load dashboard statistics";
      showToast(errorMessage, "error");
    }
  }, [error, showToast]);

  React.useEffect(() => {
    if (regError) {
      const errorMessage =
        (regError as any)?.data?.message ||
        "Failed to load registration trends";
      showToast(errorMessage, "error");
    }
  }, [regError, showToast]);

  React.useEffect(() => {
    if (engError) {
      const errorMessage =
        (engError as any)?.data?.message || "Failed to load engagement metrics";
      showToast(errorMessage, "error");
    }
  }, [engError, showToast]);

  if (isLoading || regLoading || engLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  // Show error state if all data failed to load
  if (!dashboardStats && !registrationTrend && !engagementMetrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Unable to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-400 bg-opacity-30">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-3xl font-bold">
                {dashboardStats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-400 bg-opacity-30">
              <UserCheck size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Subscribed Users</h3>
              <p className="text-3xl font-bold">
                {dashboardStats?.subscribedUsers || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-400 bg-opacity-30">
              <GamepadIcon size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Games</h3>
              <p className="text-3xl font-bold">
                {dashboardStats?.totalGames || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily User Registration Trend">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={registrationTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New Users"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="User Engagement Metrics">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-600">New user registered</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
              <UserCheck size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                User subscription activated
              </p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-4">
              <GamepadIcon size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-600">New game added</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Daily active users increased by 12%
              </p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
