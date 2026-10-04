import { Bell, ChevronLeft, CircleHelp, CreditCard, Fingerprint, Headphones, LoaderCircle, LockKeyhole, LogOut, Plus, ShieldCheck, SlidersHorizontal, UserRound, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/UI';
import { useLedger } from '../context/LedgerContext';

const profileLinks = [
  { to: '/profile/cards', title: 'کارت‌های بانکی', detail: 'مدیریت کارت‌های متصل', icon: CreditCard },
  { to: '/profile/settings', title: 'تنظیمات و امنیت', detail: 'حریم خصوصی و امنیت حساب', icon: SlidersHorizontal },
];

export function ProfilePage() {
  const { state } = useLedger();
  const navigate = useNavigate();
  return (
    <div className="page-body profile-page">
      <PageHeader title="پروفایل" trailing={<button className="square-icon-button" aria-label="تنظیمات" onClick={() => navigate('/profile/settings')}><SlidersHorizontal size={18} /></button>} />
      <div className="profile-identity card-surface">
        <span className="profile-avatar"><UserRound size={28} /></span>
        <div className="profile-name"><strong>علی رضایی</strong><span dir="ltr">ali.rezaei@example.com</span></div>
        <span className="verified-tag"><ShieldCheck size={14} /> احراز هویت‌شده</span>
      </div>
      <div className="profile-summary card-surface">
        <div><span>شناسه کاربری</span><b dir="ltr">RA-204815</b></div>
        <div><span>سطح حساب</span><b>کاربر عادی</b></div>
        <div><span>کارت بانکی</span><b>{state.cards.length} کارت</b></div>
      </div>
      <section className="profile-section">
        <h2>حساب کاربری</h2>
        {profileLinks.map(({ to, title, detail, icon: Icon }) => (
          <Link to={to} className="profile-link card-surface" key={to}><span className="profile-link-icon"><Icon size={19} /></span><span className="profile-link-copy"><strong>{title}</strong><small>{detail}</small></span><ChevronLeft size={17} /></Link>
        ))}
      </section>
      <section className="profile-section">
        <h2>نیاز به راهنمایی دارید؟</h2>
        <button className="profile-link card-surface"><span className="profile-link-icon"><CircleHelp size={19} /></span><span className="profile-link-copy"><strong>سوالات متداول</strong><small>پاسخ پرسش‌های رایج</small></span><ChevronLeft size={17} /></button>
        <button className="profile-link card-surface"><span className="profile-link-icon"><Headphones size={19} /></span><span className="profile-link-copy"><strong>پشتیبانی</strong><small>همراه شما هستیم</small></span><ChevronLeft size={17} /></button>
      </section>
      <button className="logout-button"><LogOut size={17} /> خروج از حساب</button>
      <p className="demo-note">پروفایل نمایشی · نسخه ۱٫۰٫۰</p>
    </div>
  );
}

export function CardsPage() {
  const { state, dispatch } = useLedger();
  function setDefault(id: string) {
    dispatch({ type: 'cards/updated', cards: state.cards.map((card) => ({ ...card, isDefault: card.id === id })) });
  }
  function addCard() {
    const cardNumber = String(1000 + state.cards.length * 137).slice(-4);
    dispatch({ type: 'cards/updated', cards: [...state.cards, { id: `card-${Date.now()}`, bank: 'بانک نمونه', holder: 'علی رضایی', lastFour: cardNumber, isDefault: state.cards.length === 0 }] });
  }
  function removeCard(id: string) {
    const next = state.cards.filter((card) => card.id !== id);
    if (next.length && !next.some((card) => card.isDefault)) next[0] = { ...next[0]!, isDefault: true };
    dispatch({ type: 'cards/updated', cards: next });
  }

  return (
    <div className="page-body cards-page">
      <PageHeader title="کارت‌های بانکی" backTo="/profile" />
      <p className="page-intro">برای واریز و برداشت تومان از کارت‌های نمونه استفاده کنید.</p>
      <div className="bank-card-list">
        {state.cards.map((card) => (
          <article key={card.id} className="bank-card card-surface">
            <div className="bank-card-top"><span className="bank-card-icon"><CreditCard size={19} /></span><span>{card.bank}</span>{card.isDefault ? <small className="default-label">پیش‌فرض</small> : null}</div>
            <strong className="card-number" dir="ltr"><span>••••</span><span>••••</span><span>••••</span><span>{card.lastFour}</span></strong>
            <div className="bank-card-bottom"><span>{card.holder}</span><div>{!card.isDefault ? <button onClick={() => setDefault(card.id)}>انتخاب پیش‌فرض</button> : null}<button className="remove-card" onClick={() => removeCard(card.id)}>حذف</button></div></div>
          </article>
        ))}
      </div>
      <button className="secondary-button full-button add-card-button" onClick={addCard}><Plus size={17} /> افزودن کارت نمونه</button>
      <div className="notice-card"><ShieldCheck size={18} /><p>اطلاعات کارت‌ها در این نمونه ساختگی است و هیچ پرداختی انجام نمی‌شود.</p></div>
    </div>
  );
}

export function SettingsPage() {
  const [biometric, setBiometric] = useState(true);
  const [notifications, setNotifications] = useState(true);
  return (
    <div className="page-body settings-page">
      <PageHeader title="تنظیمات" backTo="/profile" />
      <section className="settings-group card-surface">
        <h2>امنیت حساب</h2>
        <button className="setting-row"><span className="setting-icon"><LockKeyhole size={18} /></span><span><strong>رمز عبور</strong><small>آخرین تغییر: ۳۰ روز پیش</small></span><ChevronLeft size={17} /></button>
        <button className="setting-row" onClick={() => setBiometric(!biometric)}><span className="setting-icon"><Fingerprint size={18} /></span><span><strong>ورود بیومتریک</strong><small>ورود امن با اثر انگشت یا تشخیص چهره</small></span><i className={`toggle ${biometric ? 'on' : ''}`} /></button>
      </section>
      <section className="settings-group card-surface">
        <h2>اعلان‌ها</h2>
        <button className="setting-row" onClick={() => setNotifications(!notifications)}><span className="setting-icon"><Bell size={18} /></span><span><strong>اعلان تراکنش‌ها</strong><small>اطلاع از واریز و برداشت</small></span><i className={`toggle ${notifications ? 'on' : ''}`} /></button>
      </section>
      <section className="settings-group card-surface">
        <h2>درباره</h2>
        <div className="setting-row"><span className="setting-icon"><WalletCards size={18} /></span><span><strong>نسخه برنامه</strong><small>۱٫۰٫۰ · نسخه نمایشی رزومه</small></span></div>
      </section>
      <section className="settings-group card-surface">
        <h2>حالت‌های نمایشی کیف پول</h2>
        <Link className="setting-row" to="/wallet?preview=loading"><span className="setting-icon"><LoaderCircle size={18} /></span><span><strong>پیش‌نمایش بارگذاری</strong><small>نمایش اسکلت هنگام دریافت داده‌ها</small></span><ChevronLeft size={17} /></Link>
        <Link className="setting-row" to="/wallet?preview=empty"><span className="setting-icon"><WalletCards size={18} /></span><span><strong>پیش‌نمایش کیف پول خالی</strong><small>نمایش حالت شروع برای حساب جدید</small></span><ChevronLeft size={17} /></Link>
      </section>
      <p className="demo-note">تنظیمات فقط در همین صفحه قابل تغییر هستند.</p>
    </div>
  );
}
