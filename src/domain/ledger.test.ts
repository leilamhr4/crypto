import { describe, expect, it } from 'vitest';
import {
  createInitialLedger,
  formatFaNumber,
  ledgerReducer,
  normalizeDigits,
  totalValueToman,
  validateAmount,
  type Transaction,
} from './ledger';

describe('Persian money input and formatting', () => {
  it('formats balances using Persian digits and grouping separators', () => {
    expect(formatFaNumber(125_450_000)).toBe('۱۲۵٬۴۵۰٬۰۰۰');
  });

  it('normalizes Persian and Arabic digits before parsing', () => {
    expect(normalizeDigits('۱۰۵٬۴۵۰٬۰۰۰')).toBe('105450000');
    expect(normalizeDigits('١٢٣٫٥')).toBe('123.5');
  });

  it('rejects empty, zero, malformed, and over-balance amounts', () => {
    expect(validateAmount('', 500)).toBe('required');
    expect(validateAmount('۰', 500)).toBe('minimum');
    expect(validateAmount('12..3', 500)).toBe('invalid');
    expect(validateAmount('۵۰۱', 500)).toBe('insufficient');
    expect(validateAmount('۴۹۹', 500)).toBeNull();
  });
});

describe('ledgerReducer', () => {
  it('seeds the dashboard with the reference balance', () => {
    expect(totalValueToman(createInitialLedger())).toBe(125_450_000);
  });

  it('updates Toman balance and transaction history after a successful withdrawal', () => {
    const initial = createInitialLedger();
    const before = initial.tomanBalance;
    const transaction: Transaction = {
      id: 'tx-withdraw-1',
      type: 'withdraw_toman',
      status: 'success',
      amount: 2_500_000,
      assetId: 'toman',
      createdAt: '2026-10-04T08:00:00.000Z',
      title: 'برداشت تومان',
      detail: 'کارت نمونه •• ۴۸۲۱',
      fee: 10_000,
    };

    const next = ledgerReducer(initial, { type: 'transaction/completed', transaction });

    expect(next.tomanBalance).toBe(before - 2_510_000);
    expect(next.transactions[0]).toEqual(transaction);
    expect(initial.tomanBalance).toBe(before);
  });

  it('adds a crypto deposit to the matching asset and records its history', () => {
    const initial = createInitialLedger();
    const btcBefore = initial.assets.find((asset) => asset.id === 'btc')?.balance ?? 0;
    const transaction: Transaction = {
      id: 'tx-deposit-1',
      type: 'deposit_crypto',
      status: 'success',
      amount: 0.002,
      assetId: 'btc',
      createdAt: '2026-10-04T08:00:00.000Z',
      title: 'واریز بیت‌کوین',
      detail: 'شبکه Bitcoin',
    };

    const next = ledgerReducer(initial, { type: 'transaction/completed', transaction });

    expect(next.assets.find((asset) => asset.id === 'btc')?.balance).toBeCloseTo(btcBefore + 0.002);
    expect(next.transactions[0]?.id).toBe(transaction.id);
  });

  it('updates both asset balances after a successful trade', () => {
    const initial = createInitialLedger();
    const usdtBefore = initial.assets.find((asset) => asset.id === 'usdt')?.balance ?? 0;
    const btcBefore = initial.assets.find((asset) => asset.id === 'btc')?.balance ?? 0;
    const transaction: Transaction = {
      id: 'tx-trade-1',
      type: 'trade',
      status: 'success',
      amount: 0.001,
      assetId: 'btc',
      fromAssetId: 'usdt',
      toAssetId: 'btc',
      fromAmount: 50,
      toAmount: 0.001,
      createdAt: '2026-10-04T08:00:00.000Z',
      title: 'تبدیل تتر به بیت‌کوین',
      detail: 'معامله نمونه',
    };

    const next = ledgerReducer(initial, { type: 'transaction/completed', transaction });

    expect(next.assets.find((asset) => asset.id === 'usdt')?.balance).toBeCloseTo(usdtBefore - 50);
    expect(next.assets.find((asset) => asset.id === 'btc')?.balance).toBeCloseTo(btcBefore + 0.001);
  });

  it('does not mutate or add a failed transaction to the successful ledger', () => {
    const initial = createInitialLedger();
    const next = ledgerReducer(initial, {
      type: 'transaction/completed',
      transaction: {
        id: 'tx-failed',
        type: 'withdraw_toman',
        status: 'failed',
        amount: 9_000_000_000,
        assetId: 'toman',
        createdAt: '2026-10-04T08:00:00.000Z',
        title: 'برداشت تومان',
        detail: 'موجودی ناکافی',
      },
    });

    expect(next).toBe(initial);
  });
});
