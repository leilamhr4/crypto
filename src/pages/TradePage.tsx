import { ArrowDownUp, ArrowLeftRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, CoinIcon } from '../components/UI';
import { useLedger } from '../context/LedgerContext';
import { formatCrypto, formatFaNumber, formatToman, parseAmount, validateAmount, type Transaction } from '../domain/ledger';

type TradeStage = 'form' | 'review' | 'result';

export function TradePage() {
  const { state, dispatch } = useLedger();
  const [fromId, setFromId] = useState('usdt');
  const [toId, setToId] = useState('btc');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<TradeStage>('form');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<Transaction | null>(null);
  const from = state.assets.find((asset) => asset.id === fromId) ?? state.assets[0]!;
  const to = state.assets.find((asset) => asset.id === toId) ?? state.assets[1]!;
  const numericAmount = parseAmount(amount);
  const feeRate = 0.0025;
  const receiveAmount = Number.isFinite(numericAmount) && numericAmount > 0
    ? numericAmount * from.priceToman / to.priceToman * (1 - feeRate)
    : 0;
  const amountError = useMemo(() => validateAmount(amount, from.balance, 0.00000001), [amount, from.balance]);

  function swapPair() {
    setFromId(toId);
    setToId(fromId);
    setAmount('');
  }

  function continueToReview(event: FormEvent) {
    event.preventDefault();
    if (amountError) {
      setError(amountError === 'insufficient' ? 'موجودی این دارایی برای معامله کافی نیست.' : 'مبلغ واردشده را بررسی کنید.');
      return;
    }
    setError('');
    setStage('review');
  }

  function confirmTrade() {
    const transaction: Transaction = {
      id: `trade-${Date.now()}`,
      type: 'trade',
      status: 'success',
      amount: receiveAmount,
      assetId: to.id,
      fromAssetId: from.id,
      toAssetId: to.id,
      fromAmount: numericAmount,
      toAmount: receiveAmount,
      createdAt: new Date().toISOString(),
      title: `تبدیل ${from.symbol} به ${to.symbol}`,
      detail: `نرخ نمایشی · کارمزد ${formatFaNumber(feeRate * 100, { maximumFractionDigits: 2 })}٪`,
    };
    dispatch({ type: 'transaction/completed', transaction });
    setCompleted(transaction);
    setStage('result');
  }

  if (stage === 'result' && completed) {
    return (
      <div className="page-body result-page">
        <PageHeader title="نتیجه معامله" backTo="/trade" />
        <div className="result-card card-surface">
          <span className="result-icon success"><CheckCircle2 size={31} /></span>
          <h2>معامله با موفقیت انجام شد</h2>
          <p>{formatCrypto(completed.fromAmount ?? 0)} {from.symbol} به {formatCrypto(completed.toAmount ?? 0)} {to.symbol} تبدیل شد.</p>
          <div className="result-summary"><span>شناسه تراکنش</span><b>{completed.id}</b><span>وضعیت</span><b className="change-positive">موفق</b></div>
          <Link to={`/transactions/${completed.id}`} className="secondary-button full-button">مشاهده جزئیات</Link>
          <button className="text-button" onClick={() => { setAmount(''); setStage('form'); }}>معامله‌ی جدید</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body trade-page">
      <PageHeader title="معامله" eyebrow="تبدیل سریع دارایی" />
      <div className="trade-assurance"><ShieldCheck size={18} /><span>بدون دفتر سفارش · اجرای شبیه‌سازی‌شده</span></div>
      {stage === 'form' ? (
        <form className="trade-card card-surface" onSubmit={continueToReview}>
          <div className="form-label-row"><label htmlFor="trade-amount">پرداخت می‌کنید</label><span>موجودی: {formatCrypto(from.balance)} {from.symbol}</span></div>
          <div className="trade-input-row">
            <input id="trade-amount" inputMode="decimal" autoComplete="off" placeholder="۰٫۰۰۰" value={amount} onChange={(event) => { setAmount(event.target.value); setError(''); }} />
            <select value={fromId} onChange={(event) => { setFromId(event.target.value); if (event.target.value === toId) setToId(fromId); }} aria-label="دارایی پرداختی">
              {state.assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.symbol}</option>)}
            </select>
          </div>
          <span className="input-subline">≈ {formatToman(Number.isFinite(numericAmount) ? numericAmount * from.priceToman : 0)}</span>
          <div className="swap-control"><span /><button type="button" aria-label="جابه‌جایی دارایی‌ها" onClick={swapPair}><ArrowDownUp size={18} /></button><span /></div>
          <div className="form-label-row"><label>دریافت می‌کنید</label><span>موجودی: {formatCrypto(to.balance)} {to.symbol}</span></div>
          <div className="trade-input-row receive-row"><div>{receiveAmount ? formatCrypto(receiveAmount) : '۰٫۰۰۰'}</div><select value={toId} onChange={(event) => { setToId(event.target.value); if (event.target.value === fromId) setFromId(toId); }} aria-label="دارایی دریافتی">
            {state.assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.symbol}</option>)}
          </select></div>
          <div className="quote-details"><span>نرخ تبدیل</span><b>۱ {from.symbol} ≈ {formatCrypto(from.priceToman / to.priceToman)} {to.symbol}</b><span>کارمزد معامله</span><b>۰٫۲۵٪</b></div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button full-button" type="submit">بررسی معامله <ArrowLeftRight size={17} /></button>
        </form>
      ) : (
        <div className="review-card card-surface">
          <div className="review-icon-pair"><CoinIcon asset={from} size="lg" /><ArrowLeftRight size={18} /><CoinIcon asset={to} size="lg" /></div>
          <h2>تأیید معامله</h2>
          <p className="review-lead">لطفاً جزئیات تبدیل را پیش از تأیید بررسی کنید.</p>
          <div className="review-line"><span>پرداخت</span><strong>{formatCrypto(numericAmount)} {from.symbol}</strong></div>
          <div className="review-line"><span>دریافت تقریبی</span><strong>{formatCrypto(receiveAmount)} {to.symbol}</strong></div>
          <div className="review-line"><span>ارزش معامله</span><strong>{formatToman(numericAmount * from.priceToman)}</strong></div>
          <div className="review-line"><span>کارمزد</span><strong>۰٫۲۵٪</strong></div>
          <button className="primary-button full-button" onClick={confirmTrade}>تأیید و انجام معامله</button>
          <button className="text-button" onClick={() => setStage('form')}>ویرایش اطلاعات</button>
        </div>
      )}
      <p className="demo-note">این صفحه فقط برای نمایش نمونه ساخته شده است و سفارش واقعی ثبت نمی‌کند.</p>
    </div>
  );
}
