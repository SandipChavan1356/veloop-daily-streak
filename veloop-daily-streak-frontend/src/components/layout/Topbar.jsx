import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStreakData } from '../../context/StreakDataContext';
import Logo from '../common/Logo';
import { StreakBadge, GemPill, RupeePill } from '../common/StatPills';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';
import { NAV_GROUPS } from './navItems';
import styles from './Topbar.module.css';

const LABELS = Object.fromEntries(NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.to, i.label])));

export default function Topbar({ onMenu }) {
  const { streak, ves, inr } = useStreakData();
  const { pathname } = useLocation();
  const here = pathname === '/daily-streak' ? 'Streak' : LABELS[pathname];

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <span className={styles.mobileLogo}><Logo compact /></span>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <span>VELoop</span>
          {here && (<><i>/</i><b>{here}</b></>)}
        </nav>
      </div>
      <div className={styles.right}>
        <StreakBadge days={streak?.currentStreak} />
        <GemPill value={ves} />
        <RupeePill value={inr} />
        <NotificationsMenu streak={streak} />
        <UserMenu />
      </div>
    </header>
  );
}
