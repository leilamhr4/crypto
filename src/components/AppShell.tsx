import { BarChart3, ArrowLeftRight, CircleUserRound, WalletCards } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { layoutTransition, routeVariants } from '../animation/motion-tokens';
import { TapNavLink } from './AnimatedInteractions';

const tabs = [
  { to: '/profile', label: 'پروفایل', icon: CircleUserRound, key: 'profile' },
  { to: '/wallet', label: 'کیف پول', icon: WalletCards, key: 'wallet' },
  { to: '/market', label: 'بازار', icon: BarChart3, key: 'market' },
  { to: '/trade', label: 'معامله', icon: ArrowLeftRight, key: 'trade' },
];

export function StatusBar() {
  return (
    <div className="status-bar" aria-label="وضعیت دستگاه">
      <div className="status-icons" aria-hidden="true">
        <svg viewBox="0 0 45 16"><path d="M3 13h3V9H3zm6 0h3V6H9zm6 0h3V3h-3zM23 5.5a7.5 7.5 0 0 1 11 0m-8.3 3a3.8 3.8 0 0 1 5.6 0M29.5 12.5h.1" fill="currentColor"/><rect x="37" y="3" width="15" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="52.5" y="6" width="2" height="4" rx="1" fill="currentColor"/><rect x="39" y="5" width="10.5" height="6" rx="1" fill="currentColor"/></svg>
      </div>
      <span className="status-time">۹:۴۱</span>
    </div>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const routeContentRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (routeContentRef.current) routeContentRef.current.scrollTop = 0;
  }, [pathname]);

  const activeKey = pathname.startsWith('/profile')
    ? 'profile'
    : pathname.startsWith('/market')
      ? 'market'
      : pathname.startsWith('/trade')
        ? 'trade'
        : 'wallet';

  return (
    <div className="app-stage">
      <div className="phone-shell">
        <StatusBar />
        <main className="route-content" ref={routeContentRef}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={pathname}
              className="route-screen"
              variants={routeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav className="bottom-nav" aria-label="ناوبری اصلی">
          {tabs.map(({ to, label, icon: Icon, key }) => (
            <TapNavLink
              key={to}
              to={to}
              className={`bottom-nav-item ${activeKey === key ? 'active' : ''}`}
              aria-current={activeKey === key ? 'page' : undefined}
            >
              {activeKey === key ? <motion.span layoutId="bottom-nav-indicator" className="bottom-nav-indicator" transition={{ layout: layoutTransition }} aria-hidden="true" /> : null}
              <span className="bottom-nav-icon"><Icon size={22} strokeWidth={1.8} /></span>
              <span>{label}</span>
            </TapNavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
