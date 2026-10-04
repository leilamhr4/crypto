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
