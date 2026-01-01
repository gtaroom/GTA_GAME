import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import RoleBasedRoute from "./components/RoleBasedRoute";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import CouponManagement from "./pages/CouponManagement";
import Dashboard from "./pages/Dashboard";
import DrawWinners from "./pages/DrawWinners";
import EmailCommunication from "./pages/EmailCommunication";
import GameAccountRequests from "./pages/GameAccountRequests";
import Login from "./pages/Login";
import Recharges from "./pages/Recharges";
import UserBalance from "./pages/UserBalance";
// import UserManagement from './pages/UserManagement';
import EnhancedUserManagement from "./pages/EnhancedUserManagement";
import UserDetails from './pages/UserDetails';
import RoleManagement from "./pages/RoleManagement";
import { HomeRedirect } from "./components/HomeRedirect";
// import SupportManagement from './pages/SupportManagement';
import Withdrawals from "./pages/Withdrawals";
import Transactions from "./pages/Transactions";
import AffiliateManagement from './pages/AffiliateManagement';
import SpinWheelManagement from './pages/SpinWheelManagement';
import PrivateRoute from "./PrivateRoute";
// import SmsBroadcast from "./pages/SmsSender";
import MailchimpManagement from "./pages/MailchimpManagement";
import TwilioManagement from "./pages/TwilioManagement";
import LegalDocumentsManagement from "./pages/LegalDocumentsManagement";
import AdminBannerManagement from "./pages/AdminBannerManagement";

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<Login />} />
            {/* Protected routes with permission-based access */}
            <Route element={<PrivateRoute />}>
              {/* Dashboard - if not allowed, jump to first accessible route */}
              <Route
                path="/"
                element={
                  <RoleBasedRoute
                    allowedRoles={["ADMIN", "DESIGNER"]}
                    autoRedirectToFirstAllowed
                  >
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                    <HomeRedirect />
                  </RoleBasedRoute>
                }
              />

              {/* User Management - accessible by users with canViewAllUsers permission */}
              <Route
                path="/users"
                element={
                  <RoleBasedRoute requiredPermissions={["canViewAllUsers"]}>
                    <MainLayout>
                      <EnhancedUserManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />
              
              {/* User Details - accessible by users with canViewAllUsers permission */}
              <Route path="/users/:id" element={
                <RoleBasedRoute requiredPermissions={["canViewAllUsers"]}>
                  <MainLayout>
                    <UserDetails />
                  </MainLayout>
                </RoleBasedRoute>
              } />

              {/* Role Management - accessible by users with canManageRoles permission */}
              <Route
                path="/roles"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageRoles"]}>
                    <MainLayout>
                      <RoleManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* User Balance - accessible by users with financial permissions */}
              <Route
                path="/balance"
                element={
                  <RoleBasedRoute requiredPermissions={["canViewAllUsers"]}>
                    <MainLayout>
                      <UserBalance />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Draw Winners - accessible by users with game management permissions */}
              <Route path="/draw-winners" element={
                <RoleBasedRoute allowedRoles={["ADMIN"]}>
                  <MainLayout>
                    <DrawWinners />
                  </MainLayout>
                </RoleBasedRoute>
              } />
              
              {/* Email Communication - accessible by users with system management permissions */}
              <Route
                path="/email"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageSystem"]}>
                    <MainLayout>
                      <EmailCommunication />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Withdrawals - accessible by users with financial permissions */}
              <Route
                path="/withdrawals"
                element={
                  <RoleBasedRoute
                    requiredPermissions={["canViewSupportTickets"]}
                  >
                    <MainLayout>
                      <Withdrawals />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Recharges - accessible by users with financial permissions */}
              <Route
                path="/recharges"
                element={
                  <RoleBasedRoute
                    requiredPermissions={["canViewSupportTickets"]}
                  >
                    <MainLayout>
                      <Recharges />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Transactions - accessible by users with transaction view permission */}
              <Route
                path="/transactions"
                element={
                  <RoleBasedRoute
                    requiredPermissions={["canViewAllTransactions"]}
                  >
                    <MainLayout>
                      <Transactions />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Game Account Requests - accessible by users with game management permissions */}
              <Route
                path="/game-accounts"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageGames"]}>
                    <MainLayout>
                      <GameAccountRequests />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Coupons - accessible by users with system management permissions */}
              <Route
                path="/coupons"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageSystem"]}>
                    <MainLayout>
                      <CouponManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />
              
              {/* Affiliates - accessible only by ADMIN */}
              <Route path="/affiliates" element={
                <RoleBasedRoute allowedRoles={["ADMIN"]}>
                  <MainLayout>
                    <AffiliateManagement />
                  </MainLayout>
                </RoleBasedRoute>
              } />
              
              {/* Spin Wheel - accessible only by ADMIN */}
              <Route path="/spin-wheel" element={
                <RoleBasedRoute allowedRoles={["ADMIN"]}>
                  <MainLayout>
                    <SpinWheelManagement />
                  </MainLayout>
                </RoleBasedRoute>
              } />
              <Route
                path="/email-marketing"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageSystem"]}>
                    <MainLayout>
                      <MailchimpManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/sms-marketing"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageSystem"]}>
                    <MainLayout>
                      <TwilioManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/legal-documents"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageSystem"]}>
                    <MainLayout>
                      <LegalDocumentsManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/banner-management"
                element={
                  <RoleBasedRoute requiredPermissions={["canManageBanners"]}>
                    <MainLayout>
                      <AdminBannerManagement />
                    </MainLayout>
                  </RoleBasedRoute>
                }
              />

              {/* <Route path="/admin/sms" element={<SmsBroadcast />} /> */}
            </Route>
            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
