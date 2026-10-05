import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { bottomNavTransition, layoutTransition, loadingMotion, routeVariants } from '../animation/motion-tokens';
import { TapNavLink } from './AnimatedInteractions';
import { ChartSquareIcon, TransferHorizontalIcon, UserCircleIcon, Wallet2Icon } from './icons';
import { InitialLoadingOverlay, RouteLoadingSkeleton } from './LoadingStates';

const tabs = [
  { to: '/wallet', label: 'کیف پول', icon: Wallet2Icon, key: 'wallet' },
  { to: '/market', label: 'بازار', icon: ChartSquareIcon, key: 'market' },
  { to: '/trade', label: 'معامله', icon: TransferHorizontalIcon, key: 'trade' },
  { to: '/profile', label: 'پروفایل', icon: UserCircleIcon, key: 'profile' },
];

// Flip this single switch to restore the original bottom navigation treatment.
const refinedBottomNav = true;

export function AppShell() {
  const { pathname } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const routePathname = pathname.replace(/\/+$/, '') || '/';
  const outlet = useOutlet();
  const routeContentRef = useRef<HTMLElement>(null);
  const [initialRouteReady, setInitialRouteReady] = useState(false);
  const [minimumIntroElapsed, setMinimumIntroElapsed] = useState(false);
  const [initialOverlayExitComplete, setInitialOverlayExitComplete] = useState(false);
  const canDismissInitialOverlay = initialRouteReady && minimumIntroElapsed;
  const initialOverlayBlocking = !initialOverlayExitComplete;

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumIntroElapsed(true), loadingMotion.minimumIntroVisibleMs);
    return () => window.clearTimeout(timer);
  }, []);

  const markInitialRouteReady = useCallback(() => setInitialRouteReady(true), []);
  useLayoutEffect(() => {
    if (routeContentRef.current) routeContentRef.current.scrollTop = 0;
  }, [pathname]);

  const hasPageRoute = routePathname === '/wallet'
    || routePathname === '/market'
    || routePathname.startsWith('/market/')
    || routePathname === '/trade'
    || routePathname === '/transactions'
    || routePathname.startsWith('/transactions/')
    || routePathname.startsWith('/deposit/')
    || routePathname.startsWith('/withdraw/')
    || routePathname === '/profile'
    || routePathname === '/profile/cards'
    || routePathname === '/profile/settings';

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
        <main
          className="route-content"
          ref={routeContentRef}
          aria-hidden={initialOverlayBlocking}
          inert={initialOverlayBlocking}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={pathname}
              className="route-screen"
              variants={routeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense fallback={<RouteLoadingSkeleton pathname={routePathname} />}>
                {outlet}
                {hasPageRoute ? <RouteReadySignal onReady={markInitialRouteReady} /> : null}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <nav
          className={`bottom-nav${refinedBottomNav ? ' bottom-nav--refined' : ''}`}
          aria-label="ناوبری اصلی"
          aria-hidden={initialOverlayBlocking}
          inert={initialOverlayBlocking}
        >
          {tabs.map(({ to, label, icon: Icon, key }) => (
            <TapNavLink
              key={to}
              to={to}
              tapScale={refinedBottomNav ? 0.985 : 0.96}
              className={`bottom-nav-item ${activeKey === key ? 'active' : ''}`}
              aria-current={activeKey === key ? 'page' : undefined}
            >
              {activeKey === key ? <motion.span layoutId="bottom-nav-indicator" className="bottom-nav-indicator" transition={{ layout: prefersReducedMotion ? { duration: 0.01 } : refinedBottomNav ? bottomNavTransition : layoutTransition }} aria-hidden="true" /> : null}
              <span className="bottom-nav-icon"><Icon size={refinedBottomNav ? 20 : 22} strokeWidth={1.8} /></span>
              <span>{label}</span>
            </TapNavLink>
          ))}
        </nav>
        <AnimatePresence onExitComplete={() => setInitialOverlayExitComplete(true)}>
          {!canDismissInitialOverlay ? <InitialLoadingOverlay key="initial-loading" /> : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RouteReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}
