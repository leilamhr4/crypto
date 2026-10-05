import type { Asset, Transaction } from '../domain/ledger';
import { formatCrypto, formatFaNumber, formatToman } from '../domain/ledger';
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TapButton, TapLink } from './AnimatedInteractions';
import { AddIcon, AltArrowLeftIcon, ArrowDownIcon, ArrowLeftDownIcon, ArrowRightUpIcon, ArrowUpIcon, ClockCircleIcon, TransferHorizontalIcon, Wallet2Icon } from './icons';

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const walletTrendCycleMs = 9_000;
const walletTrendReadoutMs = 1_980;

export function PageHeader({
  title,
  eyebrow,
  backTo,
  historyBack = false,
  trailing,
}: {
  title: string;
  eyebrow?: string;
  backTo?: string;
  historyBack?: boolean;
  trailing?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const handleHistoryBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }
    if (backTo) navigate(backTo);
  };

  return (
    <header className="page-header">
      <div className="page-heading">
        {backTo ? historyBack
          ? <TapButton className="back-button" type="button" onClick={handleHistoryBack} aria-label="بازگشت"><AltArrowLeftIcon size={20} /></TapButton>
          : <TapLink className="back-button" to={backTo} aria-label="بازگشت"><AltArrowLeftIcon size={20} /></TapLink>
          : null}
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
        </div>
      </div>
      {trailing}
    </header>
  );
}

export function CoinIcon({ asset, size = 'md' }: { asset: Pick<Asset, 'id' | 'symbol' | 'color'>; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`coin-icon coin-${asset.id} coin-${size}`} style={{ '--coin': asset.color } as React.CSSProperties} aria-hidden="true">
      <CryptoCoinMark id={asset.id} fallback={asset.symbol.slice(0, 1)} />
    </span>
  );
}

// Inlined from Simple Icons v16 SVG marks so they stay crisp and work offline (CC0-1.0).
function CryptoCoinMark({ id, fallback }: { id: string; fallback: string }) {
  const solanaGradientId = `solana-brand-${useId().replace(/:/g, '')}`;

  if (id === 'sol') {
    return (
      <svg className="coin-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={solanaGradientId} x1="5%" y1="100%" x2="95%" y2="0%">
            <stop offset="8%" stopColor="#9945FF" />
            <stop offset="30%" stopColor="#8752F3" />
            <stop offset="50%" stopColor="#5497D5" />
            <stop offset="60%" stopColor="#43B4CA" />
            <stop offset="72%" stopColor="#28E0B9" />
            <stop offset="97%" stopColor="#19FB9B" />
          </linearGradient>
        </defs>
        <path fill={`url(#${solanaGradientId})`} d="m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z" />
      </svg>
    );
  }

  const mark = id === 'btc'
    ? <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" />
    : id === 'eth'
      ? <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
      : id === 'usdt'
        ? <path d="M18.7538 10.5176c0 .6251-2.2379 1.1483-5.2381 1.2812l.0028.0007c-.0848.0064-.5233.0325-1.5012.0325-.7778 0-1.33-.0233-1.5237-.0325-3.0059-.1322-5.2495-.6555-5.2495-1.2819s2.2436-1.149 5.2495-1.2834v2.0442c.1965.0142.7594.0474 1.5372.0474.9334 0 1.4008-.0389 1.4849-.0466V9.2356c2.9994.1337 5.2381.657 5.2381 1.282zm5.19.5466L12.1248 22.389a.1803.1803 0 0 1-.2496 0L.0562 11.0635a.1781.1781 0 0 1-.0382-.2079l4.3762-9.1921a.1767.1767 0 0 1 .1626-.1026h14.8878a.1768.1768 0 0 1 .1612.1032l4.3762 9.1922a.1782.1782 0 0 1-.0382.2079zm-4.478-.4038c0-.8068-2.5515-1.4799-5.9473-1.6369V7.195h4.186V4.4055H6.3076V7.195h4.1852v1.8286c-3.4018.1562-5.9601.83-5.9601 1.6376 0 .8075 2.5583 1.4806 5.9601 1.6376v5.8618h3.025v-5.8639c3.394-.1563 5.948-.8295 5.948-1.6363z" />
        : null;

  return mark
    ? <svg className="coin-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{mark}</svg>
    : <span className="coin-fallback">{fallback}</span>;
}

export function Sparkline({ values, positive, className = '', area = false, endpoint = false }: { values: number[]; positive: boolean; className?: string; area?: boolean; endpoint?: boolean }) {
  const width = 82;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - 3 - ((value - min) / range) * (height - 7);
    return `${x},${y}`;
  });
  const lastValue = values[values.length - 1] ?? min;
  const lastY = height - 3 - ((lastValue - min) / range) * (height - 7);
  return (
    <svg className={`sparkline ${positive ? 'positive' : 'negative'} ${className}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {area ? <polygon className="sparkline-area" points={`0,${height} ${points.join(' ')} ${width},${height}`} /> : null}
      <polyline points={points.join(' ')} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {endpoint ? <circle className="sparkline-endpoint" cx={width} cy={lastY} r="2.4" /> : null}
    </svg>
  );
}

export function AssetRow({
  asset,
  compact = false,
  walletLayout = false,
  usdRateToman = 0,
  trendCycleOffsetMs = 0,
}: {
  asset: Asset;
  compact?: boolean;
  walletLayout?: boolean;
  usdRateToman?: number;
  trendCycleOffsetMs?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [showDailyChange, setShowDailyChange] = useState(false);
  const value = asset.balance * asset.priceToman;
  const dailyChangeLabel = `${asset.dailyChange >= 0 ? '+' : '−'}${formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 })}٪`;
  const usdValueLabel = usdRateToman > 0 ? usdFormatter.format(value / usdRateToman) : 'نامشخص';

  useEffect(() => {
    if (!walletLayout || prefersReducedMotion) return;

    let cycleInterval: number;
    let hideTimeout: number;
    const startTimeout = window.setTimeout(() => {
      const revealDailyChange = () => {
        setShowDailyChange(true);
        hideTimeout = window.setTimeout(() => setShowDailyChange(false), walletTrendReadoutMs);
      };

      revealDailyChange();
      cycleInterval = window.setInterval(revealDailyChange, walletTrendCycleMs);
    }, walletTrendCycleMs + Math.max(0, trendCycleOffsetMs));

    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(cycleInterval);
      window.clearTimeout(hideTimeout);
    };
  }, [prefersReducedMotion, trendCycleOffsetMs, walletLayout]);

  if (walletLayout) {
    const showTrendValue = Boolean(prefersReducedMotion) || showDailyChange;
    const trendTransition = prefersReducedMotion ? { duration: 0.01 } : { duration: 0.42, ease: 'easeOut' as const };
    const trendExit = prefersReducedMotion
      ? { opacity: 0, transition: { duration: 0.01 } }
      : { opacity: 0, y: -4, filter: 'blur(1px)', transition: { duration: 0.27, ease: 'easeIn' as const } };

    return (
      <TapLink
        to={`/market/${asset.symbol.toLowerCase()}`}
        className="asset-row asset-row--wallet"
        aria-label={`${asset.name} (${asset.symbol})، موجودی ${formatCrypto(asset.balance)} ${asset.symbol}، ارزش ${formatToman(value)}، معادل ${usdValueLabel}، تغییر روزانه ${dailyChangeLabel}`}
      >
        <div className="asset-wallet-identity" dir="rtl">
          <CoinIcon asset={asset} />
          <div className="asset-name">
            <strong>{asset.name} <span className="asset-symbol">({asset.symbol})</span></strong>
            <span>{formatCrypto(asset.balance)} <span className="asset-ticker">{asset.symbol}</span></span>
          </div>
        </div>

        <div className={`asset-wallet-chart ${asset.dailyChange >= 0 ? 'trend-positive' : 'trend-negative'}`} aria-hidden="true">
          <div className="asset-trend-stage">
            <AnimatePresence initial={false} mode="wait">
              {showTrendValue ? (
                <motion.div
                  key="daily-change"
                  className={`asset-trend-readout ${asset.dailyChange >= 0 ? 'change-positive' : 'change-negative'}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 5, filter: 'blur(1px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={trendExit}
                  transition={trendTransition}
                >
                  <span className="asset-trend-readout-value" dir="ltr">
                    {asset.dailyChange >= 0 ? <ArrowUpIcon size={11} /> : <ArrowDownIcon size={11} />}
                    <strong>{dailyChangeLabel}</strong>
                  </span>
                  <small>تغییر روزانه</small>
                </motion.div>
              ) : (
                <motion.div
                  key="sparkline"
                  className="asset-trend-graph"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4, filter: 'blur(1px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={trendExit}
                  transition={trendTransition}
                >
                  <Sparkline values={asset.sparkline} positive={asset.dailyChange >= 0} className="asset-sparkline" area endpoint />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="asset-wallet-value" dir="rtl">
          <strong>{formatToman(value)}</strong>
          <small><span>ارزش دلاری</span><b dir="ltr">{usdValueLabel}</b></small>
        </div>
      </TapLink>
    );
  }

  return (
    <TapLink
      to={`/market/${asset.symbol.toLowerCase()}`}
      className={`asset-row ${compact ? 'compact' : ''}`}
      aria-label={`${asset.name} (${asset.symbol})، موجودی ${formatCrypto(asset.balance)} ${asset.symbol}، ارزش ${formatToman(value)}، ${asset.dailyChange >= 0 ? 'افزایش' : 'کاهش'} ${formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 })} درصد روزانه`}
    >
      <CoinIcon asset={asset} />
      <div className="asset-name" dir="rtl">
        <strong>{asset.name} <span className="asset-symbol">({asset.symbol})</span></strong>
        <span>{formatCrypto(asset.balance)} <span className="asset-ticker">{asset.symbol}</span></span>
      </div>
      <div className={`asset-metrics ${asset.dailyChange >= 0 ? 'trend-positive' : 'trend-negative'}`} dir="rtl">
        <div className="asset-money">
          <strong>{formatToman(value)}</strong>
          <span className={asset.dailyChange >= 0 ? 'change-positive' : 'change-negative'}>
          {asset.dailyChange >= 0 ? <ArrowUpIcon size={11} /> : <ArrowDownIcon size={11} />} {formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 })}٪
          </span>
        </div>
        <Sparkline values={asset.sparkline} positive={asset.dailyChange >= 0} className="asset-sparkline" area endpoint />
      </div>
    </TapLink>
  );
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const incoming = transaction.type === 'deposit_toman' || transaction.type === 'deposit_crypto';
  const credit = incoming || transaction.type === 'trade';
  const statusText: Record<Transaction['status'], string> = {
    pending: 'در حال پردازش',
    success: 'موفق',
    failed: 'ناموفق',
    cancelled: 'لغوشده',
  };
  return (
    <TapLink className="transaction-row" to={`/transactions/${transaction.id}`}>
      <span className={`transaction-direction ${credit ? 'incoming' : ''}`}>
        {transaction.type === 'trade' ? <TransferHorizontalIcon size={18} /> : incoming ? <ArrowLeftDownIcon size={18} /> : <ArrowRightUpIcon size={18} />}
      </span>
      <span className="transaction-copy">
        <strong>{transaction.title}</strong>
        <small>{transaction.detail}</small>
      </span>
      <span className="transaction-value">
        <strong className={credit ? 'change-positive' : ''}>{credit ? '+' : '−'}{formatFaNumber(transaction.amount, { maximumFractionDigits: 8 })}</strong>
        <small className={`status-${transaction.status}`}>{transaction.status === 'pending' ? <ClockCircleIcon size={11} /> : null}{statusText[transaction.status]}</small>
      </span>
    </TapLink>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="section-title"><h2>{title}</h2>{action}</div>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true"><Wallet2Icon className="empty-wallet" size={28} /><span className="empty-plus"><AddIcon size={10} /></span></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action}
    </div>
  );
}
