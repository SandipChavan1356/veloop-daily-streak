import { Menu } from 'lucide-react';
import { useStreakData } from '../../context/StreakDataContext';
import Logo from '../common/Logo';
import { StreakBadge, GemPill, RupeePill } from '../common/StatPills';
import NavPill from './NavPill';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';
import styles from './Topbar.module.css';

export default function Topbar({ onMenu }) {
  const { streak, ves, inr } = useStreakData();
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
          <Logo />
        </div>
        <div className={styles.center}><NavPill /></div>
        <div className={styles.right}>
          <StreakBadge days={streak?.currentStreak} />
          <GemPill value={ves} />
          <RupeePill value={inr} />
          <NotificationsMenu streak={streak} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
