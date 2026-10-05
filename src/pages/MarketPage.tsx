import { AnimatedList, AnimatedListItem, TapButton } from '../components/AnimatedInteractions';
import { ArrowDownIcon, ArrowDownToLineIcon, ArrowUpIcon, GraphUpIcon, MagnifierIcon, TransferHorizontalIcon, Tuning2Icon, Wallet2Icon } from '../components/icons';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetRow, CoinIcon, PageHeader, Sparkline } from '../components/UI';
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
          <Sparkline values={asset.sparkline} positive={positive} className="large-sparkline" area endpoint />
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
