import { ArrowDown, ArrowUp, Search, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { AnimatedList, AnimatedListItem, TapButton } from '../components/AnimatedInteractions';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetRow, CoinIcon, PageHeader, SectionTitle, Sparkline } from '../components/UI';
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
        <div className="market-overview-title"><span><TrendingUp size={18} /></span><div><small>ارزش کل بازار</small><strong>۲٫۴۸ تریلیون دلار</strong></div></div>
        <div className="market-overview-stats"><span>تغییر ۲۴ ساعته</span><b className="change-positive">+۲٫۶٪</b><span>حجم معاملات</span><b>$۸۷٫۳ میلیارد</b></div>
      </div>
      <div className="market-search-tools">
        <label className="search-field market-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام یا نماد دارایی" /></label>
        <TapButton className="square-icon-button" aria-label="تغییر ترتیب" onClick={() => setSort(sort === 'value' ? 'change' : 'value')}><SlidersHorizontal size={18} /></TapButton>
      </div>
      <div className="market-table-head"><span>دارایی</span><TapButton onClick={() => setSort(sort === 'value' ? 'change' : 'value')}>{sort === 'value' ? 'ارزش دارایی' : 'تغییر روزانه'} <ArrowDown size={13} /></TapButton></div>
      <AnimatedList className="market-list">
        {assets.map((asset, index) => (
          <AnimatedListItem className="market-asset-card" key={asset.id}>
            <AssetRow asset={asset} compact />
            <span className="market-rank">{formatFaNumber(index + 1)}</span>
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
  return (
    <div className="page-body asset-detail-page">
      <PageHeader title="جزئیات دارایی" backTo="/market" trailing={<TapButton className="square-icon-button" aria-label="بازار" onClick={() => navigate('/market')}><SlidersHorizontal size={17} /></TapButton>} />
      <div className="asset-detail-hero card-surface">
        <div className="asset-detail-coin"><CoinIcon asset={asset} size="lg" /><div><h2>{asset.name}</h2><span>{asset.symbol}</span></div></div>
        <strong className="asset-price">{formatToman(asset.priceToman)}</strong>
        <span className={`asset-change ${positive ? 'change-positive' : 'change-negative'}`}>{positive ? <ArrowUp size={15} /> : <ArrowDown size={15} />}{formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 })}٪ امروز</span>
        <div className="detail-chart"><Sparkline values={asset.sparkline} positive={positive} className="large-sparkline" /><div><span>۲۴ ساعت</span><span>۷ روز</span><span>۱ ماه</span><span>۱ سال</span></div></div>
        <div className="asset-holding"><span>موجودی شما</span><strong>{formatCrypto(asset.balance)} {asset.symbol}</strong><small>{formatToman(assetValueToman(asset))}</small></div>
      </div>
      <div className="detail-actions"><TapButton className="primary-button" onClick={() => navigate('/trade')}>معامله {asset.symbol}</TapButton><TapButton className="secondary-button" onClick={() => navigate('/deposit/crypto')}>واریز</TapButton></div>
      <section className="detail-info card-surface"><SectionTitle title="درباره دارایی" /><p>اطلاعات قیمت و موجودی این صفحه برای نمایش تجربه‌ی کیف پول شبیه‌سازی شده است و به بازار زنده متصل نیست.</p></section>
    </div>
  );
}
