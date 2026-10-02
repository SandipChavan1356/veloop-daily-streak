import { LayoutDashboard, Flame, Gift, Award, Target, Activity, Trophy, User, Settings } from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/daily-streak', label: 'My Streak', icon: Flame },
      { to: '/rewards', label: 'Rewards', icon: Gift },
      { to: '/achievements', label: 'Achievements', icon: Award },
    ],
  },
  {
    label: 'Progress',
    items: [
      { to: '/milestones', label: 'Milestones', icon: Target },
      { to: '/activity', label: 'Activity', icon: Activity },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Mobile bottom bar: the five destinations people use daily.
export const BOTTOM_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/daily-streak', label: 'Streak', icon: Flame, primary: true },
  { to: '/leaderboard', label: 'Ranks', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];
