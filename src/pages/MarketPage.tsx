import { AnimatedList, AnimatedListItem, TapButton } from '../components/AnimatedInteractions';
import { ArrowDownIcon, ArrowDownToLineIcon, ArrowUpIcon, GraphUpIcon, MagnifierIcon, TransferHorizontalIcon, Tuning2Icon, Wallet2Icon } from '../components/icons';
import { useId, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetRow, CoinIcon, PageHeader } from '../components/UI';
import { useLedger } from '../context/LedgerContext';
import { assetValueToman, formatCrypto, formatFaNumber, formatToman } from '../domain/ledger';

export function MarketPage() {
  const { state } = useLedger();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'value' | 'change'>('value');
  const assets = useMemo(() => {
    const needle = query.toLocaleLowerCase('fa-IR').trim();
    return state.assets
      .filter((asset) => !needle || `${asset.name} ${asset.symbol}`.toLocaleLowerCase('fa-IR').includes(needle))
      .sort((a, b) => sort === 'value' ? assetValueToman(b) - assetValueToman(a) : b.dailyChange - a.dailyChange);
  }, [query, sort, state.assets]);

  return (
    <div className="page-body market-page">
      <PageHeader title="بازار" eyebrow="قیمت لحظه‌ای" trailing={<span className="market-live"><i /> بازار باز است</span>} />
      <div className="market-overview card-surface">
        <div className="market-overview-title"><span><GraphUpIcon size={18} /></span><div><small>ارزش کل بازار</small><strong>۲٫۴۸ تریلیون دلار</strong></div></div>
        <div className="market-overview-stats"><span>تغییر ۲۴ ساعته</span><b className="change-positive">+۲٫۶٪</b><span>حجم معاملات</span><b>$۸۷٫۳ میلیارد</b></div>
      </div>
      <div className="market-search-tools">
        <label className="search-field market-search"><MagnifierIcon size={19} /><input aria-label="جست‌وجوی نام یا نماد دارایی" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام یا نماد دارایی" /></label>
        <TapButton className="square-icon-button" aria-label="تغییر ترتیب" onClick={() => setSort(sort === 'value' ? 'change' : 'value')}><Tuning2Icon size={18} /></TapButton>
      </div>
      <div className="market-table-head"><span>دارایی</span><TapButton onClick={() => setSort(sort === 'value' ? 'change' : 'value')}>{sort === 'value' ? 'ارزش دارایی' : 'تغییر روزانه'} <ArrowDownIcon size={13} /></TapButton></div>
      <AnimatedList className="market-list">
        {assets.map((asset) => (
          <AnimatedListItem className="market-asset-card" key={asset.id}>
            <AssetRow asset={asset} compact />
          </AnimatedListItem>
        ))}
        {!assets.length ? <AnimatedListItem key="empty-market" className="empty-state compact-empty"><h2>نتیجه‌ای پیدا نشد</h2><p>عبارت دیگری را امتحان کنید.</p></AnimatedListItem> : null}
      </AnimatedList>
      <p className="demo-note">قیمت‌ها در این نسخه نمایشی هستند.</p>
    </div>
  );
}

export function AssetDetailPage() {
  const { symbol = '' } = useParams();
  const { state } = useLedger();
  const navigate = useNavigate();
  const asset = state.assets.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase() || item.id === symbol.toLowerCase());

  if (!asset) return <div className="page-body"><PageHeader title="دارایی پیدا نشد" backTo="/market" /><div className="empty-state"><h2>این دارایی در نسخه‌ی نمایشی وجود ندارد</h2><p>به فهرست بازار برگردید و دارایی دیگری انتخاب کنید.</p></div></div>;

  const positive = asset.dailyChange >= 0;
  const dailyChangeLabel = formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 });
  return (
    <div className="page-body asset-detail-page">
      <PageHeader title="جزئیات دارایی" backTo="/market" historyBack />
      <section className="asset-detail-overview card-surface" aria-label={`قیمت ${asset.name}`}>
        <div className="asset-detail-heading">
          <div className="asset-detail-coin">
            <CoinIcon asset={asset} size="lg" />
            <div><h2>{asset.name}</h2><span className="asset-detail-symbol" dir="ltr">{asset.symbol}</span></div>
          </div>
        </div>
        <div className="asset-detail-quote">
          <div className="asset-detail-price-copy">
            <span className="asset-detail-label">قیمت فعلی</span>
            <strong className="asset-price">{formatToman(asset.priceToman)}</strong>
          </div>
          <span className={`asset-change ${positive ? 'change-positive' : 'change-negative'}`} aria-label={`${positive ? 'افزایش' : 'کاهش'} ${dailyChangeLabel} درصد در ۲۴ ساعت`}>
            {positive ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
            {positive ? '+' : '−'}{dailyChangeLabel}٪
          </span>
        </div>
        <div className="detail-chart">
          <div className="detail-chart-heading"><span>روند قیمت</span><span className="detail-chart-period">۲۴ ساعت</span></div>
          <AssetDetailChart values={asset.sparkline} positive={positive} />
          <div className="detail-chart-axis"><span>۲۴ ساعت پیش</span><span>اکنون</span></div>
        </div>
      </section>
      <section className="asset-holding card-surface" aria-label="موجودی دارایی">
        <span className="asset-holding-icon"><Wallet2Icon size={18} /></span>
        <div className="asset-holding-quantity">
          <span>موجودی شما</span>
          <strong><bdi>{formatCrypto(asset.balance)} <small>{asset.symbol}</small></bdi></strong>
        </div>
        <i className="asset-holding-divider" />
        <div className="asset-holding-worth">
          <span>ارزش تقریبی</span>
          <strong>{formatToman(assetValueToman(asset))}</strong>
        </div>
      </section>
      <div className="detail-actions">
        <TapButton className="primary-button" onClick={() => navigate('/trade')}><TransferHorizontalIcon size={17} /> معامله {asset.symbol}</TapButton>
        <TapButton className="secondary-button" onClick={() => navigate('/deposit/crypto')}><ArrowDownToLineIcon size={17} /> واریز</TapButton>
      </div>
      <section className="detail-info card-surface">
        <div className="detail-info-heading"><h2>درباره دارایی</h2><span>نسخه‌ی نمایشی</span></div>
        <p>قیمت‌ها و موجودی این صفحه برای نمایش تجربه‌ی کیف پول شبیه‌سازی شده‌اند و به بازار زنده متصل نیستند.</p>
      </section>
    </div>
  );
}

function AssetDetailChart({ values, positive }: { values: number[]; positive: boolean }) {
  const gradientId = useId().replace(/:/g, '');
  const width = 360;
  const height = 136;
  const safeValues = values.length ? values : [0];
  const min = Math.min(...safeValues);
  const range = Math.max(...safeValues) - min || 1;
  const points = safeValues.map((value, index) => ({
    x: 12 + (index / Math.max(safeValues.length - 1, 1)) * (width - 24),
    y: 15 + (1 - (value - min) / range) * 91,
  }));
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1]!;
    const previousPrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? point;
    const control1X = previous.x + (point.x - previousPrevious.x) / 6;
    const control1Y = previous.y + (point.y - previousPrevious.y) / 6;
    const control2X = point.x - (next.x - previous.x) / 6;
    const control2Y = point.y - (next.y - previous.y) / 6;
    return `${path} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point.x} ${point.y}`;
  }, '');
  const areaPath = `${linePath} L ${last.x} 126 L ${first.x} 126 Z`;

  return (
    <svg
      className={`asset-detail-chart-svg ${positive ? 'positive' : 'negative'}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`نمودار روند ${positive ? 'صعودی' : 'نزولی'} قیمت در ۲۴ ساعت گذشته`}
    >
      <defs>
        <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-color)" stopOpacity=".2" />
          <stop offset="72%" stopColor="var(--chart-color)" stopOpacity=".055" />
          <stop offset="100%" stopColor="var(--chart-color)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--chart-color)" stopOpacity=".64" />
          <stop offset="52%" stopColor="var(--chart-color)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--chart-color)" stopOpacity=".86" />
        </linearGradient>
      </defs>
      {[26, 66, 106].map((y) => <line className="asset-detail-chart-grid" key={y} x1="8" x2={width - 8} y1={y} y2={y} />)}
      <path className="asset-detail-chart-area" d={areaPath} fill={`url(#${gradientId}-area)`} />
      <path className="asset-detail-chart-glow" d={linePath} />
      <path className="asset-detail-chart-line" d={linePath} pathLength={1} stroke={`url(#${gradientId}-line)`} />
      <circle className="asset-detail-chart-aura" cx={last.x} cy={last.y} r="10" />
      <circle className="asset-detail-chart-ring" cx={last.x} cy={last.y} r="5.2" />
      <circle className="asset-detail-chart-core" cx={last.x} cy={last.y} r="2.1" />
    </svg>
  );
}
