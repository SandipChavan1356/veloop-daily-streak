import { NavLink } from 'react-router-dom';
import { useStreakData } from '../../context/StreakDataContext';
import { NAV_GROUPS } from './navItems';
import styles from './NavPill.module.css';

const ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Floating capsule navigation. Icons only until active: the current page's pill
// opens to reveal its label (pure CSS grid-track animation, no layout JS).
export default function NavPill() {
  const { streak } = useStreakData();
  return (
    <nav className={styles.pill} aria-label="Primary">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} title={label} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <Icon size={19} strokeWidth={1.9} />
          <span className={styles.label}><span>{label}</span></span>
          {to === '/daily-streak' && streak?.eligibleNow && <i className={styles.ready} aria-label="Reward ready" />}
        </NavLink>
      ))}
    </nav>
  );
}
