import { motion, useReducedMotion } from 'motion/react';
import { loadingMotion } from '../animation/motion-tokens';

type RouteSkeletonKind =
  | 'market'
  | 'asset-detail'
  | 'history'
  | 'transaction-detail'
  | 'trade'
  | 'flow'
  | 'profile'
  | 'cards'
  | 'settings';

const skeletonRows = [0, 1, 2, 3];

export function InitialLoadingOverlay() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="first-load-overlay"
      role="status"
      aria-live="polite"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : loadingMotion.overlayExit}
    >
      <motion.div
        className="first-load-visual"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : loadingMotion.visualEntrance}
        aria-hidden="true"
      >
        <svg className="first-load-flow" viewBox="0 0 144 112" fill="none">
          <path className="first-load-trace-base" d="M18 64 C52 24 65 98 126 46" />
          <motion.path
            className="first-load-trace-active"
            d="M18 64 C52 24 65 98 126 46"
            initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0.65 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : loadingMotion.traceDraw}
          />
          <motion.circle
            className="first-load-node"
            r="2.5"
            initial={prefersReducedMotion ? false : { cx: 18, cy: 64 }}
            animate={prefersReducedMotion
              ? { cx: 61.875, cy: 59.5 }
              : {
                  cx: [18, 29.9, 40.6, 51.03, 61.875, 73.98, 88.17, 105.24, 126],
                  cy: [64, 53.9, 51.6, 54.75, 59.5, 65.46, 65.13, 64.08, 46],
                }}
            transition={prefersReducedMotion ? { duration: 0 } : loadingMotion.nodeTravel}
          />
        </svg>
      </motion.div>
      <span className="visually-hidden">در حال آماده‌سازی کیف پول</span>
    </motion.div>
  );
}

export function RouteLoadingSkeleton({ pathname }: { pathname: string }) {
  const routePathname = pathname.replace(/\/+$/, '') || '/';
  const kind = getRouteSkeletonKind(routePathname);
  if (!kind) return <WalletSkeleton />;

  return (
    <div className={`page-body route-skeleton route-skeleton-${kind}`} role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">صفحه در حال آماده‌شدن است</span>
      <div className="route-skeleton-visual" aria-hidden="true">
        <SkeletonPageHeader />
        {kind === 'market' ? <MarketSkeleton /> : null}
        {kind === 'asset-detail' ? <AssetDetailSkeleton /> : null}
        {kind === 'history' ? <HistorySkeleton /> : null}
        {kind === 'transaction-detail' ? <TransactionDetailSkeleton /> : null}
        {kind === 'trade' ? <TradeSkeleton /> : null}
        {kind === 'flow' ? <FlowSkeleton /> : null}
        {kind === 'profile' ? <ProfileSkeleton /> : null}
        {kind === 'cards' ? <CardsSkeleton /> : null}
        {kind === 'settings' ? <SettingsSkeleton /> : null}
      </div>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="wallet-skeleton-page" role="status" aria-label="در حال بارگذاری کیف پول" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">در حال آماده‌سازی کیف پول</span>
      <div className="wallet-skeleton-visual" aria-hidden="true">
        <section className="skeleton-hero">
          <div className="skeleton-top-actions"><i className="skeleton" /><i className="skeleton" /><i className="skeleton" /><b className="skeleton" /></div>
          <div className="skeleton-balance-switch"><i className="skeleton" /><i className="skeleton" /></div>
          <i className="skeleton skeleton-caption" />
          <i className="skeleton skeleton-balance" />
          <div className="skeleton-performance"><i className="skeleton" /><b className="skeleton" /><i className="skeleton" /><b className="skeleton" /></div>
          <i className="skeleton skeleton-collapse" />
        </section>
        <section className="skeleton-panel">
          <div className="skeleton-actions">{[0, 1, 2, 3].map((item) => <div key={item}><i className="skeleton" /><b className="skeleton" /></div>)}</div>
          <div className="skeleton-list-head"><i className="skeleton" /><i className="skeleton" /></div>
          {[0, 1, 2].map((item) => <div className="skeleton-asset" key={item}><i className="skeleton" /><i className="skeleton" /><b className="skeleton" /><em className="skeleton" /></div>)}
        </section>
      </div>
    </div>
  );
}

function getRouteSkeletonKind(pathname: string): RouteSkeletonKind | null {
  if (pathname.startsWith('/market/')) return 'asset-detail';
  if (pathname === '/market') return 'market';
  if (pathname.startsWith('/transactions/')) return 'transaction-detail';
  if (pathname === '/transactions') return 'history';
  if (pathname === '/trade') return 'trade';
  if (pathname.startsWith('/deposit/') || pathname.startsWith('/withdraw/')) return 'flow';
  if (pathname === '/profile/cards') return 'cards';
  if (pathname === '/profile/settings') return 'settings';
  if (pathname === '/profile') return 'profile';
  return null;
}

function Shape({ className = '' }: { className?: string }) {
  return <span className={`skeleton ${className}`} />;
}

function SkeletonPageHeader() {
  return (
    <div className="route-skeleton-header">
      <Shape className="skeleton-heading" />
      <Shape className="skeleton-header-action" />
    </div>
  );
}

function SkeletonListRow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`route-skeleton-row ${compact ? 'compact' : ''}`}>
      <Shape className="skeleton-coin" />
      <div className="route-skeleton-row-copy"><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div>
      <div className="route-skeleton-row-value"><Shape className="skeleton-line value" /><Shape className="skeleton-line short" /></div>
      {!compact ? <Shape className="skeleton-spark" /> : null}
    </div>
  );
}

function MarketSkeleton() {
  return (
    <>
      <div className="route-skeleton-market-overview">
        <div className="route-skeleton-overview-head"><Shape className="skeleton-icon" /><div><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /></div></div>
        <div className="route-skeleton-overview-stats"><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div>
      </div>
      <div className="route-skeleton-search-row"><Shape className="skeleton-search" /><Shape className="skeleton-icon" /></div>
      <div className="route-skeleton-list-label"><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /></div>
      <div className="route-skeleton-list">{skeletonRows.map((item) => <SkeletonListRow key={item} compact />)}</div>
    </>
  );
}

function AssetDetailSkeleton() {
  return (
    <>
      <div className="route-skeleton-detail-card">
        <div className="route-skeleton-overview-head"><Shape className="skeleton-coin large" /><div><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div></div>
        <Shape className="skeleton-line price" />
        <Shape className="skeleton-chart" />
        <div className="route-skeleton-overview-stats"><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div>
      </div>
      <div className="route-skeleton-button-row"><Shape className="skeleton-button" /><Shape className="skeleton-button" /></div>
      <div className="route-skeleton-detail-card"><Shape className="skeleton-line medium" /><Shape className="skeleton-line wide" /><Shape className="skeleton-line wide" /></div>
    </>
  );
}

function HistorySkeleton() {
  return (
    <>
      <Shape className="skeleton-search route-skeleton-history-search" />
      <div className="route-skeleton-chips"><Shape /><Shape /><Shape /><Shape /></div>
      <div className="route-skeleton-list-label"><Shape className="skeleton-line medium" /></div>
      <div className="route-skeleton-list">{skeletonRows.map((item) => <SkeletonListRow key={item} />)}</div>
    </>
  );
}

function TransactionDetailSkeleton() {
  return (
    <>
      <div className="route-skeleton-detail-card transaction">
        <Shape className="skeleton-icon large" />
        <Shape className="skeleton-line medium centered" />
        <Shape className="skeleton-line short centered" />
        <Shape className="skeleton-line price centered" />
        <div className="route-skeleton-divider" />
        {skeletonRows.map((item) => <div className="route-skeleton-review-row" key={item}><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /></div>)}
      </div>
      <Shape className="skeleton-button full" />
    </>
  );
}

function FlowSkeleton() {
  return (
    <>
      <div className="route-skeleton-stepper"><Shape className="skeleton-line short" /><i /><Shape className="skeleton-line short" /><i /><Shape className="skeleton-line short" /></div>
      <div className="route-skeleton-chips flow"><Shape /><Shape /><Shape /><Shape /></div>
      <div className="route-skeleton-detail-card flow">
        <Shape className="skeleton-line medium" />
        <Shape className="skeleton-field" />
        <Shape className="skeleton-line short" />
        <Shape className="skeleton-field" />
        <Shape className="skeleton-line short" />
        <Shape className="skeleton-field" />
      </div>
      <Shape className="skeleton-button full" />
    </>
  );
}

function TradeSkeleton() {
  return (
    <>
      <div className="route-skeleton-assurance"><Shape className="skeleton-icon" /><Shape className="skeleton-line wide" /></div>
      <div className="route-skeleton-detail-card trade">
        <div className="route-skeleton-trade-label"><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div>
        <Shape className="skeleton-field" />
        <Shape className="skeleton-line short" />
        <div className="route-skeleton-swap"><i /><Shape className="skeleton-icon" /><i /></div>
        <div className="route-skeleton-trade-label"><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div>
        <Shape className="skeleton-field" />
        <div className="route-skeleton-quote">{[0, 1].map((item) => <div key={item}><Shape className="skeleton-line short" /><Shape className="skeleton-line medium" /></div>)}</div>
        <Shape className="skeleton-button full" />
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="route-skeleton-profile-card"><Shape className="skeleton-avatar" /><div><Shape className="skeleton-line medium" /><Shape className="skeleton-line short" /></div><Shape className="skeleton-line short" /></div>
      <div className="route-skeleton-list">{skeletonRows.map((item) => <SkeletonListRow key={item} compact />)}</div>
    </>
  );
}

function CardsSkeleton() {
  return (
    <>
      <Shape className="skeleton-line wide route-skeleton-intro" />
      <Shape className="skeleton-bank-card" />
      <Shape className="skeleton-bank-card" />
      <Shape className="skeleton-button full" />
    </>
  );
}

function SettingsSkeleton() {
  return (
    <div className="route-skeleton-list settings">
      {[0, 1, 2].map((section) => (
        <div className="route-skeleton-settings-group" key={section}>
          <Shape className="skeleton-line short" />
          {[0, 1].slice(0, section === 2 ? 1 : 2).map((row) => (
            <div className="route-skeleton-row compact" key={row}>
              <Shape className="skeleton-icon" />
              <div className="route-skeleton-row-copy"><Shape className="skeleton-line medium" /><Shape className="skeleton-line wide" /></div>
              <Shape className="skeleton-toggle" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
