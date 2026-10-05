import { AnimatedList, AnimatedListItem, TapButton, TapLink } from '../components/AnimatedInteractions';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddIcon, AltArrowLeftIcon, BellIcon, Card2Icon, FaceScanCircleIcon, HeadphonesRoundIcon, LoaderIcon, LockKeyholeIcon, LogoutIcon, QuestionCircleIcon, ShieldCheckIcon, Tuning2Icon, UserRoundedIcon, Wallet2Icon } from '../components/icons';
import { PageHeader } from '../components/UI';
import { useLedger } from '../context/LedgerContext';

const profileLinks = [
  { to: '/profile/cards', title: 'کارت‌های بانکی', detail: 'مدیریت کارت‌های متصل', icon: Card2Icon },
  { to: '/profile/settings', title: 'تنظیمات و امنیت', detail: 'حریم خصوصی و امنیت حساب', icon: Tuning2Icon },
];

export function ProfilePage() {
  const { state } = useLedger();
  const navigate = useNavigate();
  return (
    <div className="page-body profile-page">
      <PageHeader title="پروفایل" trailing={<TapButton className="square-icon-button" aria-label="تنظیمات" onClick={() => navigate('/profile/settings')}><Tuning2Icon size={18} /></TapButton>} />
      <div className="profile-identity card-surface">
        <span className="profile-avatar"><UserRoundedIcon size={28} /></span>
        <div className="profile-name"><strong>علی رضایی</strong><span dir="ltr">ali.rezaei@example.com</span></div>
        <span className="verified-tag"><ShieldCheckIcon size={14} /> احراز هویت‌شده</span>
      </div>
      <div className="profile-summary card-surface">
        <div><span>شناسه کاربری</span><b dir="ltr">RA-204815</b></div>
        <div><span>سطح حساب</span><b>کاربر عادی</b></div>
        <div><span>کارت بانکی</span><b>{state.cards.length} کارت</b></div>
      </div>
      <section className="profile-section">
        <h2>حساب کاربری</h2>
        {profileLinks.map(({ to, title, detail, icon: Icon }) => (
          <TapLink to={to} className="profile-link card-surface" key={to}><span className="profile-link-icon"><Icon size={19} /></span><span className="profile-link-copy"><strong>{title}</strong><small>{detail}</small></span><AltArrowLeftIcon size={17} /></TapLink>
        ))}
      </section>
      <section className="profile-section">
        <h2>نیاز به راهنمایی دارید؟</h2>
        <TapButton className="profile-link card-surface"><span className="profile-link-icon"><QuestionCircleIcon size={19} /></span><span className="profile-link-copy"><strong>سوالات متداول</strong><small>پاسخ پرسش‌های رایج</small></span><AltArrowLeftIcon size={17} /></TapButton>
        <TapButton className="profile-link card-surface"><span className="profile-link-icon"><HeadphonesRoundIcon size={19} /></span><span className="profile-link-copy"><strong>پشتیبانی</strong><small>همراه شما هستیم</small></span><AltArrowLeftIcon size={17} /></TapButton>
      </section>
      <TapButton className="logout-button"><LogoutIcon size={17} /> خروج از حساب</TapButton>
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
      <AnimatedList className="bank-card-list">
        {state.cards.map((card) => (
          <AnimatedListItem key={card.id}>
          <article className="bank-card card-surface">
            <div className="bank-card-top"><span className="bank-card-icon"><Card2Icon size={19} /></span><span>{card.bank}</span>{card.isDefault ? <small className="default-label">پیش‌فرض</small> : null}</div>
            <strong className="card-number" dir="ltr"><span>••••</span><span>••••</span><span>••••</span><span>{card.lastFour}</span></strong>
            <div className="bank-card-bottom"><span>{card.holder}</span><div>{!card.isDefault ? <TapButton onClick={() => setDefault(card.id)}>انتخاب پیش‌فرض</TapButton> : null}<TapButton className="remove-card" onClick={() => removeCard(card.id)}>حذف</TapButton></div></div>
          </article>
          </AnimatedListItem>
        ))}
      </AnimatedList>
      <TapButton className="secondary-button full-button add-card-button" onClick={addCard}><AddIcon size={17} /> افزودن کارت نمونه</TapButton>
      <div className="notice-card"><ShieldCheckIcon size={18} /><p>اطلاعات کارت‌ها در این نمونه ساختگی است و هیچ پرداختی انجام نمی‌شود.</p></div>
    </div>
  );
}

export function SettingsPage() {
  const [biometric, setBiometric] = useState(true);
  const [notifications, setNotifications] = useState(true);
  return (
    <div className="page-body settings-page">
      <PageHeader title="تنظیمات" backTo="/profile" historyBack />
      <section className="settings-group card-surface">
        <h2>امنیت حساب</h2>
        <TapButton className="setting-row"><span className="setting-icon"><LockKeyholeIcon size={18} /></span><span><strong>رمز عبور</strong><small>آخرین تغییر: ۳۰ روز پیش</small></span><AltArrowLeftIcon size={17} /></TapButton>
        <TapButton className="setting-row" aria-pressed={biometric} onClick={() => setBiometric(!biometric)}><span className="setting-icon"><FaceScanCircleIcon size={18} /></span><span><strong>ورود بیومتریک</strong><small>ورود امن با اثر انگشت یا تشخیص چهره</small></span><i className={`toggle ${biometric ? 'on' : ''}`} /></TapButton>
      </section>
      <section className="settings-group card-surface">
        <h2>اعلان‌ها</h2>
        <TapButton className="setting-row" aria-pressed={notifications} onClick={() => setNotifications(!notifications)}><span className="setting-icon"><BellIcon size={18} /></span><span><strong>اعلان تراکنش‌ها</strong><small>اطلاع از واریز و برداشت</small></span><i className={`toggle ${notifications ? 'on' : ''}`} /></TapButton>
      </section>
      <section className="settings-group card-surface">
        <h2>درباره</h2>
        <div className="setting-row"><span className="setting-icon"><Wallet2Icon size={18} /></span><span><strong>نسخه برنامه</strong><small>۱٫۰٫۰ · نسخه نمایشی رزومه</small></span></div>
      </section>
      <section className="settings-group card-surface">
        <h2>حالت‌های نمایشی کیف پول</h2>
        <TapLink className="setting-row" to="/wallet?preview=loading"><span className="setting-icon"><LoaderIcon size={18} /></span><span><strong>پیش‌نمایش بارگذاری</strong><small>نمایش اسکلت هنگام دریافت داده‌ها</small></span><AltArrowLeftIcon size={17} /></TapLink>
        <TapLink className="setting-row" to="/wallet?preview=empty"><span className="setting-icon"><Wallet2Icon size={18} /></span><span><strong>پیش‌نمایش کیف پول خالی</strong><small>نمایش حالت شروع برای حساب جدید</small></span><AltArrowLeftIcon size={17} /></TapLink>
      </section>
      <p className="demo-note">تنظیمات فقط در همین صفحه قابل تغییر هستند.</p>
    </div>
  );
}
