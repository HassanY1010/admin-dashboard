import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MerchantsPage from './pages/MerchantsPage';
import ConsumersPage from './pages/ConsumersPage';
import OrdersPage from './pages/OrdersPage';
import TransactionsPage from './pages/TransactionsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import AccountsPage from './pages/AccountsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import { useAuthStore } from './lib/auth-store';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="consumers" element={<ConsumersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="suggestions" element={<SuggestionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;