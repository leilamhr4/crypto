import { CalendarDays, CheckCircle2, Clock3, Filter, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, TransactionRow } from '../components/UI';
import { useLedger } from '../context/LedgerContext';
import { formatFaNumber, type Transaction } from '../domain/ledger';

const statusLabels: Record<Transaction['status'], string> = {
  pending: 'در حال پردازش',
  success: 'موفق',
  failed: 'ناموفق',
  cancelled: 'لغوشده',
};

const typeLabels: Record<Transaction['type'], string> = {
  deposit_crypto: 'واریز رمزارز',
  withdraw_crypto: 'برداشت رمزارز',
  deposit_toman: 'واریز تومان',
  withdraw_toman: 'برداشت تومان',
  trade: 'معامله',
};

export function TransactionsPage() {
  const { state } = useLedger();
  const [statusFilter, setStatusFilter] = useState<'all' | Transaction['status']>('all');
  const [query, setQuery] = useState('');
  const transactions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa-IR');
    return state.transactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesQuery = !needle || `${transaction.title} ${transaction.detail} ${transaction.id}`.toLocaleLowerCase('fa-IR').includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [query, state.transactions, statusFilter]);

  return (
    <div className="page-body history-page">
      <PageHeader title="تراکنش‌ها" backTo="/wallet" trailing={<button className="square-icon-button" aria-label="فیلتر وضعیت"><Filter size={18} /></button>} />
      <label className="search-field history-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی تراکنش" /></label>
      <div className="history-filters">
        {[['all', 'همه'], ['pending', 'در انتظار'], ['success', 'موفق'], ['failed', 'ناموفق']].map(([id, label]) => (
          <button key={id} className={statusFilter === id ? 'active' : ''} onClick={() => setStatusFilter(id as typeof statusFilter)}>{label}</button>
        ))}
      </div>
      <div className="history-date"><CalendarDays size={15} /> آخرین تراکنش‌ها</div>
      <div className="transaction-list">
        {transactions.map((transaction) => <TransactionRow transaction={transaction} key={transaction.id} />)}
        {!transactions.length ? <div className="empty-state compact-empty"><h2>تراکنشی پیدا نشد</h2><p>فیلتر یا عبارت جست‌وجو را تغییر دهید.</p></div> : null}
      </div>
    </div>
  );
}

export function TransactionDetailPage() {
  const { id = '' } = useParams();
  const { state } = useLedger();
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return <div className="page-body"><PageHeader title="تراکنش پیدا نشد" backTo="/transactions" /><div className="empty-state"><h2>جزئیات این تراکنش در دسترس نیست</h2><p>با بازنشانی صفحه، داده‌های نمایشی از ابتدا بارگذاری می‌شوند.</p></div></div>;

  const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(transaction.createdAt));
  const incoming = transaction.type === 'deposit_toman' || transaction.type === 'deposit_crypto';
  const statusIcon = transaction.status === 'success' ? <CheckCircle2 size={24} /> : transaction.status === 'pending' ? <Clock3 size={24} /> : <XCircle size={24} />;
  const symbol = transaction.assetId === 'toman' ? 'تومان' : state.assets.find((asset) => asset.id === transaction.assetId)?.symbol ?? transaction.assetId.toUpperCase();

  return (
    <div className="page-body transaction-detail-page">
      <PageHeader title="جزئیات تراکنش" backTo="/transactions" />
      <div className="transaction-detail-card card-surface">
        <span className={`detail-status-icon status-${transaction.status}`}>{statusIcon}</span>
        <h2>{transaction.title}</h2>
        <span className={`detail-status status-${transaction.status}`}>{statusLabels[transaction.status]}</span>
        <strong className={`detail-amount ${incoming ? 'change-positive' : ''}`}>{incoming ? '+' : transaction.type === 'trade' ? '↔' : '−'}{formatFaNumber(transaction.amount, { maximumFractionDigits: 8 })} <small>{symbol}</small></strong>
        <div className="detail-divider" />
        <div className="review-line"><span>نوع عملیات</span><strong>{typeLabels[transaction.type]}</strong></div>
        <div className="review-line"><span>تاریخ و ساعت</span><strong>{date}</strong></div>
        <div className="review-line"><span>شناسه</span><strong className="detail-id" dir="ltr">{transaction.id}</strong></div>
        <div className="review-line"><span>جزئیات</span><strong>{transaction.detail}</strong></div>
        {transaction.fee ? <div className="review-line"><span>کارمزد</span><strong>{formatFaNumber(transaction.fee, { maximumFractionDigits: 8 })} {symbol}</strong></div> : null}
        {transaction.status === 'pending' ? <div className="pending-explainer">درخواست شما ثبت شده و در حال پردازش نمایشی است.</div> : null}
      </div>
      <Link className="secondary-button full-button" to="/wallet">بازگشت به کیف پول</Link>
    </div>
  );
}
