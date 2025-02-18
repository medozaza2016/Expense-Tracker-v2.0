import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { BusinessAnalytics } from './pages/BusinessAnalytics';
import { TransactionList } from './components/transactions/TransactionList';
import { CategoryList } from './components/categories/CategoryList';
import { UserList } from './components/users/UserList';
import { SettingsPage } from './components/settings/SettingsPage';
import { VehicleList } from './components/vehicles/VehicleList';
import { VehicleDetails } from './components/vehicles/VehicleDetails';
import { AuditPage } from './components/audit/AuditPage';
import { settingsService } from './services/settingsService';
import { useAutoLogout } from './hooks/useAutoLogout';
import { useSupabaseHealth } from './hooks/useSupabaseHealth';

// Configure React Query with retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
  },
});

export default function App() {
  // Initialize auto logout
  useAutoLogout();

  // Monitor Supabase connection health
  const { isHealthy } = useSupabaseHealth();

  useEffect(() => {
    // Update page title based on company name
    const updateTitle = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings?.company_name) {
          document.title = settings.company_name;
        }
      } catch (error) {
        console.error('Error loading company name:', error);
      }
    };

    updateTitle();
  }, []);

  if (!isHealthy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">Connection Lost</h2>
          <p className="text-text-secondary mb-4">
            We're having trouble connecting to the server. Please wait while we try to reconnect...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<BusinessAnalytics />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/audit" element={<AuditPage />} />
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
