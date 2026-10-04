import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowUpFromLine,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Eye,
  EyeOff,
  History,
  Search,
  Settings,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssetRow, CoinIcon, EmptyState, Sparkline } from '../components/UI';
import { AnimatedList, AnimatedListItem, TapButton, TapLink } from '../components/AnimatedInteractions';
import { layoutTransition, stageVariants } from '../animation/motion-tokens';
import { useLedger } from '../context/LedgerContext';
import { availableValueToman, formatFaNumber, totalValueToman } from '../domain/ledger';

const filters = [
  { id: 'all', label: 'همه' },
  { id: 'owned', label: 'دارای موجودی' },
  { id: 'gainers', label: 'سودده' },
  { id: 'pending', label: 'در حال پردازش' },
] as const;

const quickActions = [
  { label: 'تراکنش‌ها', icon: History, to: '/transactions' },
  { label: 'معامله', icon: ArrowLeftRight, to: '/trade' },
  { label: 'برداشت', icon: ArrowUpFromLine, to: '/withdraw/crypto' },
  { label: 'واریز', icon: ArrowDownToLine, to: '/deposit/crypto' },
];

export function WalletPage() {
  const { state, dispatch } = useLedger();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
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

  if (searchParams.get('preview') === 'loading') return <WalletLoadingPreview />;
  if (searchParams.get('preview') === 'empty') return <WalletEmptyPreview />;

  return (
    <div className="wallet-page">
      <motion.section
        className={`wallet-hero ${expanded ? 'hero-expanded' : 'hero-collapsed'}`}
        initial={false}
        animate={{ height: expanded ? 403 : 295 }}
        transition={{ height: layoutTransition }}
      >
        <div className="wallet-topline">
          <div className="wallet-top-actions">
            <TapButton className="round-action" aria-label="راهنما" onClick={() => navigate('/profile')}><CircleHelp size={17} /></TapButton>
            <TapButton className="round-action" aria-label="کارت‌های بانکی" onClick={() => navigate('/profile/cards')}><CreditCard size={17} /></TapButton>
            <TapButton className="round-action" aria-label="تنظیمات" onClick={() => navigate('/profile/settings')}><Settings size={17} /></TapButton>
          </div>
          <h1>دارایی‌ها</h1>
        </div>

        <div className="balance-card">
          <div className="balance-card-head">
            <div className="balance-title">
              <span className="balance-caption">مجموع دارایی</span>
              <TapButton className="balance-visibility" onClick={() => dispatch({ type: 'balance/toggled' })} aria-label={state.balanceHidden ? 'نمایش موجودی' : 'مخفی‌کردن موجودی'}>
                {state.balanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
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
              <motion.strong
                key={`${state.unit}-${mainAmount}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formatFaNumber(mainAmount, { maximumFractionDigits: state.unit === 'toman' ? 0 : 2 })}
              </motion.strong>
            )}
              <span className="balance-unit">{state.unit === 'toman' ? 'تومان' : 'USDT'}</span>
            </div>
            <p className="available-balance">قابل استفاده: <b>{state.balanceHidden ? '••••••' : formatFaNumber(availableAmount, { maximumFractionDigits: state.unit === 'toman' ? 0 : 2 })}</b> {state.unit === 'toman' ? 'تومان' : 'USDT'}</p>
          </div>

          <div className="performance-card">
            <div className="performance-copy">
              <span>سود یا ضرر کل دارایی</span>
              <strong dir="rtl">+ {formatFaNumber(performanceAmount, { maximumFractionDigits: state.unit === 'toman' ? 0 : 2 })} {state.unit === 'toman' ? 'تومان' : 'USDT'}</strong>
              <small className="performance-period" dir="rtl"><ArrowUpRight size={12} aria-hidden="true" /> ۲٫۴٪ نسبت به ماه گذشته</small>
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
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="allocation-legend">
              <div><span className="allocation-dot bitcoin" /><span>بیت‌کوین</span><b>۴۴٪</b></div>
              <div><span className="allocation-dot tether" /><span>تتر</span><b>۴۲٪</b></div>
              <div><span className="allocation-dot ethereum" /><span>اتریوم</span><b>۱۴٪</b></div>
            </div>
            <div className="allocation-donut" aria-label="تنوع دارایی‌ها">
              <span>۱۰۰٪</span>
            </div>
          </motion.div>
          ) : null}
        </AnimatePresence>
        <TapButton className="expand-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ rotate: layoutTransition }}><ChevronDown size={14} /></motion.span>
          {expanded ? 'بستن' : 'نمودار تفکیک دارایی'}
        </TapButton>
      </motion.section>

      <motion.section className="wallet-panel" layout="position" transition={{ layout: layoutTransition }}>
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
            <ChevronDown size={18} className="pending-chevron" />
          </TapLink>
        ) : null}

        <div className="asset-section-head">
          <label className="search-field" aria-label="جست‌وجوی دارایی">
            <Search size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو" />
          </label>
          <h2>لیست دارایی‌ها</h2>
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
          <TapLink to="/transactions">مشاهده تراکنش‌ها <ChevronDown size={14} /></TapLink>
          <TapLink to="/deposit/toman">واریز تومان</TapLink>
        </div>
      </motion.section>
    </div>
  );
}

function WalletLoadingPreview() {
  return (
    <div className="wallet-skeleton-page" aria-label="در حال بارگذاری کیف پول" aria-busy="true">
      <section className="skeleton-hero">
        <div className="skeleton-top-actions"><i /><i /><i /><b /></div>
        <div className="skeleton-balance-switch"><i /><i /></div>
        <i className="skeleton skeleton-caption" />
        <i className="skeleton skeleton-balance" />
        <div className="skeleton-performance"><i /><b /><i /><b /></div>
        <i className="skeleton skeleton-collapse" />
      </section>
      <section className="skeleton-panel">
        <div className="skeleton-actions">{[0, 1, 2, 3].map((item) => <div key={item}><i className="skeleton" /><b className="skeleton" /></div>)}</div>
        <div className="skeleton-list-head"><i className="skeleton" /><i className="skeleton" /></div>
        {[0, 1, 2].map((item) => <div className="skeleton-asset" key={item}><i className="skeleton" /><i className="skeleton" /><b className="skeleton" /><em className="skeleton" /></div>)}
      </section>
    </div>
  );
}

function WalletEmptyPreview() {
  const navigate = useNavigate();
  return (
    <div className="wallet-empty-preview">
      <section className="wallet-hero empty-hero">
        <div className="wallet-topline">
          <div className="wallet-top-actions"><span className="round-action"><History size={17} /></span><span className="round-action"><CreditCard size={17} /></span></div>
          <h1>دارایی‌ها</h1>
        </div>
        <div className="empty-total"><span>مجموع دارایی</span><strong>۰ <small>تومان</small></strong></div>
        <div className="empty-shortcuts">
          {quickActions.slice(0, 4).reverse().map(({ label, icon: Icon, to }) => <TapLink to={to} key={label}><Icon size={21} /><span>{label}</span></TapLink>)}
        </div>
      </section>
      <section className="wallet-panel empty-wallet-panel">
        <div className="asset-section-head"><span className="muted-caption">۰ دارایی</span><h2>لیست دارایی‌ها</h2></div>
        <EmptyState title="رمزارزی ندارید؟" detail="اولین دارایی خود را با یک معامله ساده به کیف پول اضافه کنید." action={<TapButton className="primary-button" onClick={() => navigate('/trade')}><ArrowLeftRight size={17} /> شروع معامله</TapButton>} />
      </section>
    </div>
  );
}
