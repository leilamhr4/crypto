import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AltArrowDownIcon, ArrowDownToLineIcon, ArrowRightUpIcon, ArrowUpFromLineIcon, Card2Icon, EyeClosedIcon, EyeIcon, HistoryIcon, MagnifierIcon, QuestionCircleIcon, SettingsIcon, TransferHorizontalIcon } from '../components/icons';
import { WalletSkeleton } from '../components/LoadingStates';
import { AssetRow, CoinIcon, EmptyState, Sparkline } from '../components/UI';
import { AnimatedList, AnimatedListItem, TapButton, TapLink } from '../components/AnimatedInteractions';
import { allocationMotion, layoutTransition, stageVariants } from '../animation/motion-tokens';
import { useLedger } from '../context/LedgerContext';
import { availableValueToman, formatFaNumber, totalValueToman } from '../domain/ledger';

const filters = [
  { id: 'all', label: 'همه' },
  { id: 'owned', label: 'دارای موجودی' },
  { id: 'gainers', label: 'سودده' },
  { id: 'pending', label: 'در حال پردازش' },
] as const;

const quickActions = [
  { label: 'واریز', icon: ArrowDownToLineIcon, to: '/deposit/crypto' },
  { label: 'برداشت', icon: ArrowUpFromLineIcon, to: '/withdraw/crypto' },
  { label: 'معامله', icon: TransferHorizontalIcon, to: '/trade' },
  { label: 'تراکنش‌ها', icon: HistoryIcon, to: '/transactions' },
];

const allocationAssets = [
  { id: 'bitcoin', name: 'بیت‌کوین', percent: 44 },
  { id: 'tether', name: 'تتر', percent: 42 },
  { id: 'ethereum', name: 'اتریوم', percent: 14 },
] as const;
type AllocationAssetId = (typeof allocationAssets)[number]['id'];
const allocationTotalPercent = allocationAssets.reduce((total, asset) => total + asset.percent, 0);
const allocationDonutCircumference = 2 * Math.PI * 34;
const allocationDonutGap = 2.2;
const allocationDonutLength = allocationDonutCircumference - allocationDonutGap * allocationAssets.length;

function AnimatedBalanceAmount({ value, maximumFractionDigits }: { value: number; maximumFractionDigits: number }) {
  const prefersReducedMotion = useReducedMotion();
  const amount = useMotionValue(0);
  const initialValue = useRef(value);
  const hasFinishedInitialCount = useRef(false);
  const [displayedAmount, setDisplayedAmount] = useState(() =>
    formatFaNumber(0, { maximumFractionDigits }),
  );
  const displayedAmountRef = useRef(displayedAmount);
  const formattedAmount = useTransform(amount, (current) =>
    formatFaNumber(current, { maximumFractionDigits }),
  );

  useEffect(() => {
    let lastDisplayedAt = Number.NEGATIVE_INFINITY;
    const unsubscribe = formattedAmount.on('change', (nextAmount) => {
      const now = performance.now();
      if (nextAmount === displayedAmountRef.current || now - lastDisplayedAt < 34) return;

      lastDisplayedAt = now;
      displayedAmountRef.current = nextAmount;
      setDisplayedAmount(nextAmount);
    });

    return unsubscribe;
  }, [formattedAmount]);

  useEffect(() => {
    if (hasFinishedInitialCount.current || value !== initialValue.current || prefersReducedMotion) {
      hasFinishedInitialCount.current = true;
      amount.set(value);
      const finalAmount = formatFaNumber(value, { maximumFractionDigits });
      displayedAmountRef.current = finalAmount;
      setDisplayedAmount(finalAmount);
      return;
    }

    const controls = animate(amount, value, {
      duration: 1.45,
      delay: 0.1,
      ease: [0.42, 0, 0.2, 1],
      onComplete: () => {
        hasFinishedInitialCount.current = true;
        const finalAmount = formatFaNumber(value, { maximumFractionDigits });
        displayedAmountRef.current = finalAmount;
        setDisplayedAmount(finalAmount);
      },
    });

    return () => controls.stop();
  }, [amount, maximumFractionDigits, prefersReducedMotion, value]);

  return (
    <motion.strong
      aria-live="off"
      initial={{ opacity: 0.78, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.42, 0, 0.2, 1] }}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <span style={{ display: 'inline-grid', lineHeight: 1 }}>
        <AnimatePresence initial={false}>
          <motion.span
            key={displayedAmount}
            initial={{ opacity: 0, y: 1.5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -1,
              transition: {
                opacity: { duration: 0.055, ease: 'easeIn' },
                y: { duration: 0.075, ease: 'easeIn' },
              },
            }}
            transition={{
              opacity: { duration: 0.055, ease: 'easeOut' },
              y: { duration: 0.085, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{ gridArea: '1 / 1', whiteSpace: 'nowrap' }}
          >
            {displayedAmount}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.strong>
  );
}

export function WalletPage() {
  const { state, dispatch } = useLedger();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [selectedAllocationId, setSelectedAllocationId] = useState<AllocationAssetId | null>(null);
  const [focusedAllocationId, setFocusedAllocationId] = useState<AllocationAssetId | null>(null);
  const total = totalValueToman(state);
  const available = availableValueToman(state);
  const visibleAssets = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa-IR');
    return state.assets.filter((asset) => {
      const matchesSearch = !needle || `${asset.name} ${asset.symbol}`.toLocaleLowerCase('fa-IR').includes(needle);
      const matchesFilter = filter === 'all'
        || (filter === 'owned' && asset.balance > 0)
        || (filter === 'gainers' && asset.dailyChange > 0)
        || (filter === 'pending' && state.transactions.some((transaction) => transaction.status === 'pending' && transaction.assetId === asset.id));
      return matchesSearch && matchesFilter;
    });
  }, [filter, query, state.assets, state.transactions]);

  const mainAmount = state.unit === 'toman' ? total : total / 100_000;
  const availableAmount = state.unit === 'toman' ? available : available / 100_000;
  const performanceAmount = state.unit === 'toman' ? 1_245_450 : 12.45;

  if (searchParams.get('preview') === 'loading') return <WalletSkeleton />;
  if (searchParams.get('preview') === 'empty') return <WalletEmptyPreview />;

  return (
    <div className="wallet-page">
      <motion.section
        className={`wallet-hero ${expanded ? 'hero-expanded' : 'hero-collapsed'}`}
        initial={false}
        animate={{ height: expanded ? 403 : 295 }}
        transition={{ height: prefersReducedMotion ? { duration: 0.01 } : layoutTransition }}
      >
        <div className="wallet-topline">
          <div className="wallet-top-actions">
            <TapButton className="round-action" aria-label="راهنما" onClick={() => navigate('/profile')}><QuestionCircleIcon size={17} /></TapButton>
            <TapButton className="round-action" aria-label="کارت‌های بانکی" onClick={() => navigate('/profile/cards')}><Card2Icon size={17} /></TapButton>
            <TapButton className="round-action" aria-label="تنظیمات" onClick={() => navigate('/profile/settings')}><SettingsIcon size={17} /></TapButton>
          </div>
          <h1>دارایی‌ها</h1>
        </div>

        <div className="balance-card">
          <div className="balance-card-head">
            <div className="balance-title">
              <span className="balance-caption">مجموع دارایی</span>
              <TapButton className="balance-visibility" onClick={() => dispatch({ type: 'balance/toggled' })} aria-label={state.balanceHidden ? 'نمایش موجودی' : 'مخفی‌کردن موجودی'}>
                {state.balanceHidden ? <EyeClosedIcon size={18} /> : <EyeIcon size={18} />}
              </TapButton>
            </div>
            <div className="balance-switch" role="group" aria-label="واحد نمایش موجودی">
              <TapButton className={state.unit === 'usdt' ? 'selected' : ''} aria-pressed={state.unit === 'usdt'} onClick={() => dispatch({ type: 'unit/changed', unit: 'usdt' })}>تتر</TapButton>
              <TapButton className={state.unit === 'toman' ? 'selected' : ''} aria-pressed={state.unit === 'toman'} onClick={() => dispatch({ type: 'unit/changed', unit: 'toman' })}>تومان</TapButton>
            </div>
          </div>

          <div className="total-balance">
            <div className="balance-value-row" dir="rtl">
            {state.balanceHidden ? (
              <strong>••••••••</strong>
            ) : (
              <AnimatedBalanceAmount
                value={mainAmount}
                maximumFractionDigits={state.unit === 'toman' ? 0 : 2}
              />
            )}
              <span className="balance-unit">{state.unit === 'toman' ? 'تومان' : 'USDT'}</span>
            </div>
            <p className="available-balance">قابل استفاده: <b>{state.balanceHidden ? '••••••' : formatFaNumber(availableAmount, { maximumFractionDigits: state.unit === 'toman' ? 0 : 2 })}</b> {state.unit === 'toman' ? 'تومان' : 'USDT'}</p>
          </div>

          <div className="performance-card">
            <div className="performance-copy">
              <span>سود یا ضرر کل دارایی</span>
              <strong dir="rtl">+ {formatFaNumber(performanceAmount, { maximumFractionDigits: state.unit === 'toman' ? 0 : 2 })} {state.unit === 'toman' ? 'تومان' : 'USDT'}</strong>
              <small className="performance-period" dir="rtl"><ArrowRightUpIcon size={12} aria-hidden="true" /> ۲٫۴٪ نسبت به ماه گذشته</small>
            </div>
            <Sparkline values={[32, 35, 34, 38, 36, 39, 47, 48, 50, 61, 63, 74, 73, 82, 91]} positive className="wallet-performance-sparkline" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
          <motion.div
            key="allocation-card"
            className="allocation-card"
            variants={stageVariants}
            initial={prefersReducedMotion ? false : 'initial'}
            animate="animate"
            exit={prefersReducedMotion ? { opacity: 0, transition: { duration: 0.01 } } : 'exit'}
            transition={prefersReducedMotion ? { duration: 0.01 } : allocationMotion.card}
            role="group"
            aria-labelledby="allocation-card-title"
          >
            <div className="allocation-copy">
              <div className="allocation-heading">
                <h2 id="allocation-card-title">ترکیب دارایی‌ها</h2>
                <span>{formatFaNumber(allocationAssets.length)} دارایی</span>
              </div>
              <div className="allocation-legend" role="group" aria-label="برجسته‌کردن سهم هر دارایی">
                {allocationAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className={`allocation-legend-item ${selectedAllocationId === asset.id ? 'selected' : ''} ${focusedAllocationId === asset.id ? 'focused' : ''}`}
                    aria-pressed={selectedAllocationId === asset.id}
                    onFocus={() => setFocusedAllocationId(asset.id)}
                    onBlur={(event) => {
                      const nextTarget = event.relatedTarget;
                      if (!(nextTarget instanceof Node && event.currentTarget.parentElement?.contains(nextTarget))) {
                        setFocusedAllocationId(null);
                      }
                    }}
                    onClick={() => {
                      setSelectedAllocationId((current) => current === asset.id ? null : asset.id);
                      setFocusedAllocationId(null);
                    }}
                  >
                    <span className="allocation-name"><span className={`allocation-dot ${asset.id}`} aria-hidden="true" />{asset.name}</span>
                    <b>{formatFaNumber(asset.percent)}٪</b>
                  </button>
                ))}
              </div>
            </div>
            <AllocationDonut
              activeId={focusedAllocationId ?? selectedAllocationId}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>

      <motion.section className="wallet-panel" layout="position" transition={{ layout: prefersReducedMotion ? { duration: 0.01 } : layoutTransition }}>
        <TapButton className="expand-button" onClick={() => {
          if (expanded) {
            setSelectedAllocationId(null);
            setFocusedAllocationId(null);
          }
          setExpanded((current) => !current);
        }} aria-expanded={expanded}>
          <motion.span className="expand-button-chevron" animate={{ rotate: expanded ? 180 : 0 }} transition={{ rotate: prefersReducedMotion ? { duration: 0.01 } : layoutTransition }}><AltArrowDownIcon size={15} /></motion.span>
          {expanded ? 'بستن نمودار' : 'نمایش ترکیب دارایی‌ها'}
        </TapButton>
        <div className="quick-actions">
          {quickActions.map(({ label, icon: Icon, to }) => (
            <TapLink to={to} className="quick-action" key={label}>
              <span><Icon size={23} strokeWidth={1.7} /></span>
              <small>{label}</small>
            </TapLink>
          ))}
        </div>

        {state.transactions.some((transaction) => transaction.status === 'pending') ? (
          <TapLink className="pending-banner" to={`/transactions/${state.transactions.find((transaction) => transaction.status === 'pending')?.id}`}>
            <span className="pending-coins"><CoinIcon asset={state.assets[0]!} size="sm" /><CoinIcon asset={state.assets[2]!} size="sm" /></span>
            <span><strong>در حال برداشت</strong><small>{formatFaNumber(2_450_000)} تومان</small></span>
            <AltArrowDownIcon size={18} className="pending-chevron" />
          </TapLink>
        ) : null}

        <div className="asset-section-head">
          <h2>لیست دارایی‌ها</h2>
          <label className="search-field" aria-label="جست‌وجوی دارایی">
            <MagnifierIcon size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو" />
          </label>
        </div>
        <div className="filter-list" aria-label="فیلتر دارایی‌ها">
          {filters.map(({ id, label }) => (
            <TapButton key={id} className={filter === id ? 'active' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {filter === id ? <motion.span layoutId="wallet-filter-indicator" className="filter-active-indicator" aria-hidden="true" /> : null}
              <span className="filter-label">{label}</span>
            </TapButton>
          ))}
        </div>
        <AnimatedList className="asset-list">
          {visibleAssets.map((asset) => (
            <AnimatedListItem key={asset.id}>
              <AssetRow asset={asset} />
            </AnimatedListItem>
          ))}
          {!visibleAssets.length ? (
            <AnimatedListItem key="empty-assets">
              <EmptyState title="دارایی پیدا نشد" detail="نام یا نماد دارایی دیگری را جست‌وجو کنید." />
            </AnimatedListItem>
          ) : null}
        </AnimatedList>
        <div className="wallet-foot-links">
          <TapLink to="/transactions">مشاهده تراکنش‌ها <AltArrowDownIcon size={14} /></TapLink>
          <TapLink to="/deposit/toman">واریز تومان</TapLink>
        </div>
      </motion.section>
    </div>
  );
}

function AllocationDonut({
  activeId,
  prefersReducedMotion,
}: {
  activeId: AllocationAssetId | null;
  prefersReducedMotion: boolean | null;
}) {
  const activeAsset = allocationAssets.find((asset) => asset.id === activeId) ?? null;
  let precedingArcLength = 0;

  return (
    <div className="allocation-visual">
      <svg className="allocation-donut" viewBox="0 0 88 88" aria-hidden="true">
        <circle className="allocation-donut-track" cx="44" cy="44" r="34" transform="rotate(-90 44 44)" />
        {allocationAssets.map((asset, index) => {
          const segmentLength = allocationDonutLength * asset.percent / allocationTotalPercent;
          const strokeDasharray = `${segmentLength} ${allocationDonutCircumference - segmentLength}`;
          const strokeDashoffset = -(precedingArcLength + allocationDonutGap * index);
          precedingArcLength += segmentLength;
          const isActive = activeId === asset.id;

          return (
            <motion.circle
              key={asset.id}
              className={`allocation-donut-segment ${asset.id}`}
              cx="44"
              cy="44"
              r="34"
              fill="none"
              strokeWidth="7.5"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              transform="rotate(-90 44 44)"
              initial={prefersReducedMotion ? false : { strokeDasharray: `0 ${allocationDonutCircumference}` }}
              animate={{
                strokeDasharray,
                strokeWidth: activeId ? (isActive ? 9 : 7) : 7.5,
                opacity: activeId && !isActive ? 0.3 : 1,
              }}
              transition={{
                strokeDasharray: prefersReducedMotion
                  ? { duration: 0.01 }
                  : { ...allocationMotion.arc, delay: index * allocationMotion.arcStaggerSeconds },
                strokeWidth: prefersReducedMotion ? { duration: 0.01 } : allocationMotion.selection,
                opacity: prefersReducedMotion ? { duration: 0.01 } : allocationMotion.selection,
              }}
            />
          );
        })}
      </svg>
      <div className="allocation-donut-center" aria-live={activeAsset ? 'polite' : 'off'} aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeAsset?.id ?? 'portfolio-total'}
            className="allocation-donut-reading"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.01 } }
              : { opacity: 0, y: -2, transition: allocationMotion.selection }}
            transition={prefersReducedMotion ? { duration: 0.01 } : allocationMotion.selection}
          >
            <strong>{formatFaNumber(activeAsset?.percent ?? allocationTotalPercent)}٪</strong>
            <small>{activeAsset?.name ?? 'کل سبد'}</small>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WalletEmptyPreview() {
  const navigate = useNavigate();
  return (
    <div className="wallet-empty-preview">
      <section className="wallet-hero empty-hero">
        <div className="wallet-topline">
          <div className="wallet-top-actions"><span className="round-action"><HistoryIcon size={17} /></span><span className="round-action"><Card2Icon size={17} /></span></div>
          <h1>دارایی‌ها</h1>
        </div>
        <div className="empty-total"><span>مجموع دارایی</span><strong>۰ <small>تومان</small></strong></div>
        <div className="empty-shortcuts">
          {quickActions.filter(({ label }) => label === 'معامله' || label === 'واریز').map(({ label, icon: Icon, to }) => <TapLink to={to} key={label}><Icon size={21} /><span>{label}</span></TapLink>)}
        </div>
      </section>
      <section className="wallet-panel empty-wallet-panel">
        <div className="asset-section-head"><span className="muted-caption">۰ دارایی</span><h2>لیست دارایی‌ها</h2></div>
        <EmptyState title="رمزارزی ندارید؟" detail="اولین دارایی خود را با یک معامله ساده به کیف پول اضافه کنید." action={<TapButton className="primary-button" onClick={() => navigate('/trade')}><TransferHorizontalIcon size={17} /> شروع معامله</TapButton>} />
      </section>
    </div>
  );
}
