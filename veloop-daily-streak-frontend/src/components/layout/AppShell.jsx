import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnimatedBackground from '../common/AnimatedBackground';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import DevTools from '../common/DevTools';
import styles from './AppShell.module.css';

// The ONE authenticated shell. Every logged-in page (dashboard, daily streak,
// rewards, profile, …) renders through <Outlet/>, so the sidebar, top bar and
// mobile navigation never unmount when the route changes.
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // Drawer behaves like a modal: Esc closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <AnimatedBackground />
      <a href="#main" className={styles.skip}>Skip to content</a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={styles.column}>
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className={styles.main} id="main">
          <div key={pathname} className="vl-fade">
            <Outlet />
          </div>
          <AppFooter />
        </main>
      </div>
      <BottomNav />
      <DevTools />
    </div>
  );
}
