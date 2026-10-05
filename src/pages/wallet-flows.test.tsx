import { type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../components/AppShell';
import { LedgerProvider, useLedger } from '../context/LedgerContext';
import { MoneyFlowPage } from './MoneyFlowPage';
import { TradePage } from './TradePage';
import { WalletPage } from './WalletPage';

function LedgerPeek() {
  const { state } = useLedger();
  return (
    <div>
      <output aria-label="BTC balance">{state.assets.find((asset) => asset.id === 'btc')?.balance}</output>
      <output aria-label="USDT balance">{state.assets.find((asset) => asset.id === 'usdt')?.balance}</output>
      <output aria-label="Toman balance">{state.tomanBalance}</output>
    </div>
  );
}

function renderPage(page: ReactNode, path = '/wallet') {
  return render(
    <LedgerProvider>
      <MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>
      <LedgerPeek />
    </LedgerProvider>,
  );
}

describe('wallet UI interactions', () => {
  it('shows a resolved route without a blocking first-load overlay', () => {
    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/wallet" element={<h2>کیف پول آماده</h2>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('کیف پول آماده')).toBeVisible();
    expect(document.querySelector('.first-load-overlay')).not.toBeInTheDocument();
    expect(document.querySelector('.route-content')).not.toHaveAttribute('inert');
    expect(document.querySelector('.bottom-nav')).not.toHaveAttribute('inert');
  });

  it('hides the total balance from the dashboard', async () => {
    const user = userEvent.setup();
    renderPage(<WalletPage />);

    expect(screen.getByText('۱۲۵٬۴۵۰٬۰۰۰')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'مخفی‌کردن موجودی' }));

    expect(screen.getByText('••••••••')).toBeInTheDocument();
  });

  it('switches the dashboard unit and collapses the allocation chart', async () => {
    const user = userEvent.setup();
    const { container } = renderPage(<WalletPage />);

    await user.click(screen.getByRole('button', { name: 'تتر' }));
    expect(screen.getByRole('button', { name: 'تتر' })).toHaveClass('selected');
    const tetherLegend = container.querySelectorAll('.allocation-legend-item')[1];
    expect(tetherLegend).not.toBeNull();
    await user.click(tetherLegend!);
    await waitFor(() => expect(container.querySelector('.allocation-donut-reading small')).toHaveTextContent('تتر'));
    await user.click(screen.getByRole('button', { name: 'بستن نمودار' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'نمایش ترکیب دارایی‌ها' })).toHaveAttribute('aria-expanded', 'false');
      expect(container.querySelector('.allocation-card')).not.toBeInTheDocument();
    });
  });

  it('filters the asset list by gainers and search text', async () => {
    const user = userEvent.setup();
    renderPage(<WalletPage />);

    await user.click(screen.getByRole('button', { name: 'سودده' }));
    await waitFor(() => expect(document.querySelectorAll('.asset-row')).toHaveLength(3));

    await user.type(screen.getByLabelText('جست‌وجوی دارایی'), 'SOL');
    await waitFor(() => expect(document.querySelectorAll('.asset-row')).toHaveLength(1));
    expect(screen.getByText('سولانا')).toBeInTheDocument();
  });

  it('keeps filtered asset rows present briefly while they exit', async () => {
    const { container } = renderPage(<WalletPage />);
    const assetList = container.querySelector('.asset-list');
    const search = container.querySelector<HTMLInputElement>('.search-field input');
    expect(search).not.toBeNull();

    fireEvent.change(search!, { target: { value: 'SOL' } });

    expect(assetList?.querySelectorAll('.asset-row').length).toBeGreaterThan(1);
    await waitFor(() => expect(assetList?.querySelectorAll('.asset-row')).toHaveLength(1));
  });

  it('shows the loading and empty wallet reference states on demand', () => {
    const { unmount } = renderPage(<WalletPage />, '/wallet?preview=loading');
    expect(screen.getByLabelText('در حال بارگذاری کیف پول')).toHaveAttribute('aria-busy', 'true');
    unmount();

    renderPage(<WalletPage />, '/wallet?preview=empty');
    expect(screen.getByText('رمزارزی ندارید؟')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /شروع معامله/ })).toBeInTheDocument();
  });

  it('keeps the bottom tabs available and navigates to the market', async () => {
    const user = userEvent.setup();
    renderPage(
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/wallet" element={<h2>صفحه کیف پول</h2>} />
          <Route path="/market" element={<h2>صفحه بازار</h2>} />
        </Route>
      </Routes>,
    );

    await user.click(screen.getByRole('link', { name: 'بازار' }));
    expect(screen.getByText('صفحه بازار')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'بازار' })).toHaveAttribute('aria-current', 'page');
  });

  it('simulates a crypto deposit and updates the shared ledger', async () => {
    const user = userEvent.setup();
    renderPage(<MoneyFlowPage />, '/deposit/crypto');

    await user.type(screen.getByLabelText('مبلغ واریز'), '۰٫۰۰۱');
    await user.click(screen.getByRole('button', { name: /بررسی درخواست/ }));
    expect(screen.getByText('بررسی و تأیید')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'تأیید درخواست' }));

    expect(screen.getByText('عملیات با موفقیت انجام شد')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('BTC balance')).toHaveTextContent('0.00135'));
  });

  it('simulates a Toman deposit to the selected sample card', async () => {
    const user = userEvent.setup();
    renderPage(<MoneyFlowPage />, '/deposit/toman');

    await user.type(screen.getByLabelText('مبلغ واریز'), '۵۰۰۰۰۰۰');
    await user.click(screen.getByRole('button', { name: /بررسی درخواست/ }));
    await user.click(screen.getByRole('button', { name: 'تأیید درخواست' }));

    expect(screen.getByText('عملیات با موفقیت انجام شد')).toBeInTheDocument();
    expect(screen.getByLabelText('Toman balance')).toHaveTextContent('110450000');
  });

  it('keeps a crypto withdrawal pending before updating the ledger', async () => {
    const user = userEvent.setup();
    renderPage(<MoneyFlowPage />, '/withdraw/crypto');

    await user.type(screen.getByLabelText('نشانی مقصد'), '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    await user.type(screen.getByLabelText('مبلغ برداشت'), '۰٫۰۰۰۲');
    await user.click(screen.getByRole('button', { name: /بررسی درخواست/ }));
    await user.click(screen.getByRole('button', { name: 'تأیید درخواست' }));

    expect(screen.getByText('درخواست برداشت ثبت شد')).toBeInTheDocument();
    expect(screen.getByLabelText('BTC balance')).toHaveTextContent('0.00035');
    await waitFor(() => expect(screen.getByLabelText('BTC balance')).toHaveTextContent('0.00005'), { timeout: 3000 });
    expect(screen.getByText('عملیات با موفقیت انجام شد')).toBeInTheDocument();
  });

  it('rejects a Toman withdrawal that would leave no room for the fee', async () => {
    const user = userEvent.setup();
    renderPage(<MoneyFlowPage />, '/withdraw/toman');

    await user.type(screen.getByLabelText('مبلغ برداشت'), '۱۰۵٬۴۵۰٬۰۰۰');
    await user.click(screen.getByRole('button', { name: /بررسی درخواست/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('موجودی برای این درخواست کافی نیست.');
    expect(screen.queryByText('بررسی و تأیید')).not.toBeInTheDocument();
  });

  it('reviews and confirms a trade that updates both asset balances', async () => {
    const user = userEvent.setup();
    renderPage(<TradePage />, '/trade');

    await user.type(screen.getByLabelText('پرداخت می‌کنید'), '۵۰');
    await user.click(screen.getByRole('button', { name: /بررسی معامله/ }));
    expect(screen.getByText('تأیید معامله')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'تأیید و انجام معامله' }));

    expect(screen.getByText('معامله با موفقیت انجام شد')).toBeInTheDocument();
    await waitFor(() => expect(Number(screen.getByLabelText('USDT balance').textContent)).toBeCloseTo(50.7));
    expect(Number(screen.getByLabelText('BTC balance').textContent)).toBeGreaterThan(0.00035);
  });
});
