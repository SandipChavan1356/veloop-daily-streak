import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StreakDataProvider } from '../context/StreakDataContext';

// Everything behind login: guards the route and loads streak + wallet ONCE for
// all child pages (dashboard, streak, rewards, …).
export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <StreakDataProvider>
      <Outlet />
    </StreakDataProvider>
  );
}
