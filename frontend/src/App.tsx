import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UIProvider } from './contexts/UIContext';
import { DashboardProvider } from './contexts/DashboardContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import OTPVerification from './components/auth/OTPVerification';
import RoleSelection from './components/auth/RoleSelection';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import LearningPage from './components/learning/LearningPage';
import CareerPage from './components/career/CareerPage';
import CompliancePage from './components/compliance/CompliancePage';
import WellnessPage from './components/wellness/WellnessPage';
import InitiativesListPage from './components/wellness/InitiativesListPage';
import InitiativeDetailPage from './components/wellness/InitiativeDetailPage';
import MySessionsPage from './components/wellness/MySessionsPage';
import AdminPage from './components/admin/AdminPage';
import NotificationContainer from './components/common/NotificationContainer';
import ErrorBoundary from './components/common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <UserProvider>
              <UIProvider>
                <DashboardProvider>
                  <BrowserRouter>
                    <NotificationContainer />
                    <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/select-role" element={<RoleSelection />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/learning"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <LearningPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/career"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <CareerPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <CompliancePage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wellness"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <WellnessPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wellness/initiatives"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <InitiativesListPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wellness/initiatives/:id"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <InitiativeDetailPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wellness/sessions"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <MySessionsPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requiredRole="ADMIN">
                          <Layout>
                            <AdminPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </BrowserRouter>
                </DashboardProvider>
              </UIProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
