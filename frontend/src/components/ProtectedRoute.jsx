import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading, authAvailable } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        color: 'var(--foreground-muted)'
      }}>
        Carregando...
      </div>
    );
  }

  // If auth is not available, allow access (legacy mode)
  if (!authAvailable) {
    return children;
  }

  // If auth is available but user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
