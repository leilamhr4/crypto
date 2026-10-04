import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, CheckCircle2, Clock3, Copy, QrCode, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from '../components/UI';
import { useLedger } from '../context/LedgerContext';
import { formatCrypto, formatFaNumber, formatToman, parseAmount, validateAmount, type Transaction, type TransactionType } from '../domain/ledger';

type Stage = 'form' | 'review' | 'result';
type FlowConfig = {
  type: TransactionType;
  title: string;
  assetKind: 'crypto' | 'toman';
  direction: 'in' | 'out';
};

const flows: Record<string, FlowConfig> = {
  '/deposit/crypto': { type: 'deposit_crypto', title: 'واریز رمزارز', assetKind: 'crypto', direction: 'in' },
  '/deposit/toman': { type: 'deposit_toman', title: 'واریز تومان', assetKind: 'toman', direction: 'in' },
  '/withdraw/crypto': { type: 'withdraw_crypto', title: 'برداشت رمزارز', assetKind: 'crypto', direction: 'out' },
  '/withdraw/toman': { type: 'withdraw_toman', title: 'برداشت تومان', assetKind: 'toman', direction: 'out' },
};

const networks = ['Bitcoin', 'Ethereum (ERC-20)', 'Tron (TRC-20)'];
const demoAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

export function MoneyFlowPage() {
  const { pathname } = useLocation();
  const config = flows[pathname] ?? flows['/deposit/crypto']!;
  const { state, dispatch } = useLedger();
  const [assetId, setAssetId] = useState('btc');
  const [cardId, setCardId] = useState(state.cards.find((card) => card.isDefault)?.id ?? state.cards[0]?.id ?? '');
  const [network, setNetwork] = useState(networks[0]!);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [resultStatus, setResultStatus] = useState<'pending' | 'success'>('pending');
  const [resultTransaction, setResultTransaction] = useState<Transaction | null>(null);
  const asset = state.assets.find((item) => item.id === assetId) ?? state.assets[0]!;
  const card = state.cards.find((item) => item.id === cardId) ?? state.cards[0];
  const numericAmount = parseAmount(amount);
  const isCrypto = config.assetKind === 'crypto';
  const available = config.assetKind === 'toman' ? state.tomanBalance : asset.balance;
  const fee = config.assetKind === 'toman' ? (config.direction === 'out' ? 10_000 : 0) : (config.direction === 'out' ? 0.0001 : 0);
  const spendable = Math.max(0, available - fee);
  const minimumAmount = isCrypto ? 0.00000001 : 1;
  const amountError = useMemo(() => config.direction === 'in'
    ? validateAmount(amount, Number.MAX_SAFE_INTEGER, minimumAmount)
    : validateAmount(amount, spendable, minimumAmount), [amount, config.direction, minimumAmount, spendable]);
  const isPendingResult = config.direction === 'out' && resultStatus === 'pending' && stage === 'result';

  async function copyAddress() {
    try {
      await navigator.clipboard?.writeText(demoAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function continueToReview(event: FormEvent) {
    event.preventDefault();
    if (amountError) {
      setError(amountError === 'insufficient' ? 'موجودی برای این درخواست کافی نیست.' : amountError === 'required' ? 'مبلغ را وارد کنید.' : 'مبلغ واردشده معتبر نیست.');
      return;
    }
    if (config.direction === 'out' && isCrypto && destination.trim().length < 20) {
      setError('نشانی مقصد را به‌درستی وارد کنید.');
      return;
    }
    setError('');
    setStage('review');
  }

  function createTransaction(status: Transaction['status']): Transaction {
    const title = config.direction === 'in' ? `واریز ${isCrypto ? asset.name : 'تومان'}` : `برداشت ${isCrypto ? asset.name : 'تومان'}`;
    return {
      id: `tx-${Date.now()}`,
      type: config.type,
      status,
      amount: numericAmount,
      assetId: isCrypto ? asset.id : 'toman',
      createdAt: new Date().toISOString(),
      title,
      detail: isCrypto ? network : `${card?.bank ?? 'کارت نمونه'} •• ${card?.lastFour ?? '••••'}`,
      fee,
    };
  }

  function confirmFlow() {
    const isWithdrawal = config.direction === 'out';
    const transaction = createTransaction(isWithdrawal ? 'pending' : 'success');
    if (isWithdrawal) {
      dispatch({ type: 'transaction/recorded', transaction });
      setResultStatus('pending');
      setResultTransaction(transaction);
      setStage('result');
      window.setTimeout(() => {
        const completed = { ...transaction, status: 'success' as const };
        dispatch({ type: 'transaction/completed', transaction: completed });
        setResultTransaction(completed);
        setResultStatus('success');
      }, 2200);
      return;
    }
    dispatch({ type: 'transaction/completed', transaction });
    setResultTransaction(transaction);
    setResultStatus('success');
    setStage('result');
  }

  if (stage === 'result' && resultTransaction) {
    return (
      <div className="page-body result-page">
        <PageHeader title={config.title} backTo="/wallet" />
        <div className="result-card card-surface">
          <span className={`result-icon ${isPendingResult ? 'waiting' : 'success'}`}>{isPendingResult ? <Clock3 size={29} /> : <CheckCircle2 size={31} />}</span>
          <h2>{isPendingResult ? 'درخواست برداشت ثبت شد' : 'عملیات با موفقیت انجام شد'}</h2>
          <p>{isPendingResult ? 'درخواست شما در صف پردازش قرار دارد. این وضعیت به‌صورت خودکار در نسخه‌ی نمایشی تکمیل می‌شود.' : `${formatFaNumber(resultTransaction.amount, { maximumFractionDigits: isCrypto ? 8 : 0 })} ${isCrypto ? asset.symbol : 'تومان'}`}</p>
          <div className="result-summary"><span>شناسه تراکنش</span><b>{resultTransaction.id}</b><span>وضعیت</span><b className={isPendingResult ? 'status-pending' : 'change-positive'}>{isPendingResult ? 'در حال پردازش' : 'موفق'}</b></div>
          <Link to={`/transactions/${resultTransaction.id}`} className="secondary-button full-button">مشاهده جزئیات</Link>
          <Link to="/wallet" className="text-button">بازگشت به کیف پول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body money-flow-page">
      <PageHeader title={config.title} backTo="/wallet" />
      <nav className="flow-mode" aria-label="انتخاب نوع عملیات">
        {[
          ['/deposit/crypto', 'واریز رمزارز'],
          ['/withdraw/crypto', 'برداشت رمزارز'],
          ['/deposit/toman', 'واریز تومان'],
          ['/withdraw/toman', 'برداشت تومان'],
        ].map(([to, label]) => <Link to={to!} className={pathname === to ? 'active' : ''} key={to}>{label}</Link>)}
      </nav>
      <div className="flow-stepper"><span className="complete">۱ اطلاعات</span><i /><span className={stage !== 'form' ? 'complete' : ''}>۲ بررسی</span><i /><span>۳ نتیجه</span></div>
      {stage === 'form' ? (
        <form className="flow-card card-surface" onSubmit={continueToReview}>
          {isCrypto ? (
            <>
              <label className="field-label" htmlFor="crypto-select">رمزارز</label>
              <select id="crypto-select" className="select-field" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
                {state.assets.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.symbol})</option>)}
              </select>
              <label className="field-label" htmlFor="network-select">شبکه</label>
              <select id="network-select" className="select-field" value={network} onChange={(event) => setNetwork(event.target.value)}>
                {networks.map((item) => <option key={item}>{item}</option>)}
              </select>
              {config.direction === 'in' ? (
                <div className="deposit-address-box">
                  <div className="demo-qr" aria-label="کد QR نمونه"><QrCode size={92} strokeWidth={1.3} /></div>
                  <span className="demo-chip">نشانی نمونه</span>
                  <p>برای واریز واقعی استفاده نکنید</p>
                  <div className="address-line"><code dir="ltr">{demoAddress}</code><button type="button" onClick={copyAddress} aria-label="کپی نشانی"><Copy size={16} /></button></div>
                  {copied ? <small className="copy-feedback">نشانی کپی شد</small> : null}
                </div>
              ) : (
                <>
                  <label className="field-label" htmlFor="destination">نشانی مقصد</label>
                  <input id="destination" className="text-field ltr-field" dir="ltr" autoComplete="off" placeholder="نشانی کیف پول را وارد کنید" value={destination} onChange={(event) => setDestination(event.target.value)} />
                  <p className="field-helper">شبکه‌ی مقصد باید با شبکه‌ی انتخاب‌شده یکسان باشد.</p>
                </>
              )}
            </>
          ) : (
            <>
              <label className="field-label" htmlFor="bank-card">کارت بانکی</label>
              <select id="bank-card" className="select-field" value={cardId} onChange={(event) => setCardId(event.target.value)}>
                {state.cards.map((item) => <option key={item.id} value={item.id}>{item.bank} ···· {item.lastFour}</option>)}
              </select>
            </>
          )}

          <label className="field-label" htmlFor="flow-amount">مبلغ {config.direction === 'in' ? 'واریز' : 'برداشت'}</label>
          <div className="amount-field"><input id="flow-amount" inputMode="decimal" autoComplete="off" placeholder="مبلغ را وارد کنید" value={amount} onChange={(event) => { setAmount(event.target.value); setError(''); }} /><span>{isCrypto ? asset.symbol : 'تومان'}</span></div>
          <div className="amount-helper-row"><span>{config.direction === 'out' ? `موجودی قابل برداشت: ${isCrypto ? `${formatCrypto(available)} ${asset.symbol}` : formatToman(available)}` : 'مبلغ را به‌صورت نمونه وارد کنید'}</span>{config.direction === 'out' ? <button type="button" onClick={() => setAmount(String(spendable))}>حداکثر</button> : null}</div>

          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="flow-security"><ShieldCheck size={16} /><span>{isCrypto ? `انتخاب شبکه: ${network}` : 'پرداخت شبیه‌سازی‌شده با کارت بانکی'}</span></div>
          <button className="primary-button full-button" type="submit">بررسی درخواست <ArrowLeftRight size={17} /></button>
        </form>
      ) : (
        <div className="review-card card-surface">
          <span className="review-main-icon">{config.direction === 'in' ? <ArrowDownToLine size={26} /> : <ArrowUpFromLine size={26} />}</span>
          <h2>بررسی و تأیید</h2>
          <p className="review-lead">اطلاعات درخواست را پیش از تأیید بررسی کنید.</p>
          <div className="review-line"><span>نوع عملیات</span><strong>{config.title}</strong></div>
          {isCrypto ? <div className="review-line"><span>شبکه</span><strong>{network}</strong></div> : <div className="review-line"><span>کارت</span><strong>{card?.bank} •• {card?.lastFour}</strong></div>}
          {config.direction === 'out' && isCrypto ? <div className="review-line"><span>نشانی مقصد</span><strong className="review-address" dir="ltr">{destination}</strong></div> : null}
          <div className="review-line"><span>مبلغ</span><strong>{formatFaNumber(numericAmount, { maximumFractionDigits: isCrypto ? 8 : 0 })} {isCrypto ? asset.symbol : 'تومان'}</strong></div>
          <div className="review-line"><span>کارمزد شبکه</span><strong>{formatFaNumber(fee, { maximumFractionDigits: isCrypto ? 8 : 0 })} {isCrypto ? asset.symbol : 'تومان'}</strong></div>
          {isCrypto && config.direction === 'out' ? <div className="review-line total-line"><span>دریافتی مقصد</span><strong>{formatCrypto(Math.max(0, numericAmount - fee))} {asset.symbol}</strong></div> : null}
          <button className="primary-button full-button" onClick={confirmFlow}>تأیید درخواست</button>
          <button className="text-button" onClick={() => setStage('form')}>ویرایش اطلاعات</button>
        </div>
      )}
      {config.direction === 'in' && isCrypto && stage === 'form' ? <p className="demo-note">واریز آزمایشی موجودی نمونه را در همین نشست به‌روز می‌کند.</p> : null}
    </div>
  );
}
