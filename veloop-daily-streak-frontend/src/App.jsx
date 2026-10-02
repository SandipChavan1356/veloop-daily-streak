import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastStack from './components/common/Toast';
import ProtectedLayout from './router/ProtectedLayout';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RewardsPage from './pages/Rewards/RewardsPage';
import AchievementsPage from './pages/Achievements/AchievementsPage';
import MilestonesPage from './pages/Milestones/MilestonesPage';
import ActivityPage from './pages/Activity/ActivityPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Auth guard + one-time streak/wallet load, then ONE persistent app shell.
                Every authenticated page renders through the shell's <Outlet/>. */}
            <Route element={<ProtectedLayout />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/daily-streak" element={<DailyStreakPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/milestones" element={<MilestonesPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/daily-streak" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastStack />
      </ToastProvider>
    </AuthProvider>
  );
}
