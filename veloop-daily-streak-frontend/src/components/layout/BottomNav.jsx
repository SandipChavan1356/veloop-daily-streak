import { NavLink } from 'react-router-dom';
import { BOTTOM_ITEMS } from './navItems';
import styles from './BottomNav.module.css';

// Mobile-only tab bar (dedicated mobile navigation, not a shrunken sidebar).
export default function BottomNav() {
  return (
    <nav className={styles.bar} aria-label="Quick navigation">
      {BOTTOM_ITEMS.map(({ to, label, icon: Icon, primary }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `${styles.item} ${primary ? styles.primary : ''} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.iconWrap}>
            <Icon size={primary ? 22 : 20} />
          </span>
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
