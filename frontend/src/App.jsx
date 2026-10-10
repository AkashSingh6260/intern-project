import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f6fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div className="spinner" />
        <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
          Initializing StoreRate platform...
        </p>
      </div>
    );
  }

  // If not authenticated, show unified AuthPage (login & signup tabbed)
  if (!user) {
    return <AuthPage />;
  }

  // Role-based Protected Dashboards
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'store_owner':
      return <StoreOwnerDashboard />;
    case 'normal_user':
    default:
      return <UserDashboard />;
  }
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
