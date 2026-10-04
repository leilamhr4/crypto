import { ArrowDownLeft, ArrowUpRight, ChevronLeft, Clock3 } from 'lucide-react';
import type { Asset, Transaction } from '../domain/ledger';
import { formatCrypto, formatFaNumber, formatToman } from '../domain/ledger';
import { TapLink } from './AnimatedInteractions';

export function PageHeader({
  title,
  eyebrow,
  backTo,
  trailing,
}: {
  title: string;
  eyebrow?: string;
  backTo?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-heading">
        {backTo ? <TapLink className="back-button" to={backTo} aria-label="بازگشت"><ChevronLeft size={20} /></TapLink> : null}
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
  let mark = asset.symbol.slice(0, 1);
  if (asset.id === 'btc') mark = '₿';
  if (asset.id === 'eth') mark = '◆';
  if (asset.id === 'usdt') mark = '₮';
  if (asset.id === 'sol') mark = '≋';
  return <span className={`coin-icon coin-${asset.id} coin-${size}`} style={{ '--coin': asset.color } as React.CSSProperties}>{mark}</span>;
}

export function Sparkline({ values, positive, className = '' }: { values: number[]; positive: boolean; className?: string }) {
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
  return (
    <svg className={`sparkline ${positive ? 'positive' : 'negative'} ${className}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AssetRow({ asset, compact = false }: { asset: Asset; compact?: boolean }) {
  const value = asset.balance * asset.priceToman;
  return (
    <TapLink to={`/market/${asset.symbol.toLowerCase()}`} className={`asset-row ${compact ? 'compact' : ''}`}>
      <div className="asset-money" dir="rtl">
        <strong>{formatToman(value)}</strong>
        <span className={asset.dailyChange >= 0 ? 'change-positive' : 'change-negative'}>
          {asset.dailyChange >= 0 ? '▲' : '▲'} {formatFaNumber(Math.abs(asset.dailyChange), { maximumFractionDigits: 2 })}٪
        </span>
      </div>
      <Sparkline values={asset.sparkline} positive={asset.dailyChange >= 0} />
      <div className="asset-name" dir="rtl">
        <strong>{asset.name} <span className="asset-symbol">({asset.symbol})</span></strong>
        <span>{formatCrypto(asset.balance)} <span className="asset-ticker">{asset.symbol}</span></span>
      </div>
      <CoinIcon asset={asset} />
    </TapLink>
  );
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const incoming = transaction.type === 'deposit_toman' || transaction.type === 'deposit_crypto';
  const statusText: Record<Transaction['status'], string> = {
    pending: 'در حال پردازش',
    success: 'موفق',
    failed: 'ناموفق',
    cancelled: 'لغوشده',
  };
  return (
    <TapLink className="transaction-row" to={`/transactions/${transaction.id}`}>
      <span className={`transaction-direction ${incoming ? 'incoming' : ''}`}>
        {incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </span>
      <span className="transaction-copy">
        <strong>{transaction.title}</strong>
        <small>{transaction.detail}</small>
      </span>
      <span className="transaction-value">
        <strong className={incoming ? 'change-positive' : ''}>{incoming ? '+' : '−'}{formatFaNumber(transaction.amount, { maximumFractionDigits: 8 })}</strong>
        <small className={`status-${transaction.status}`}>{transaction.status === 'pending' ? <Clock3 size={11} /> : null}{statusText[transaction.status]}</small>
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
      <div className="empty-illustration"><span className="empty-wallet">◫</span><span className="empty-plus">+</span></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action}
    </div>
  );
}
