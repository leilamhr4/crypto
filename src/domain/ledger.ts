export type CurrencyUnit = 'toman' | 'usdt';
export type TransactionType =
  | 'deposit_crypto'
  | 'withdraw_crypto'
  | 'deposit_toman'
  | 'withdraw_toman'
  | 'trade';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  priceToman: number;
  dailyChange: number;
  color: string;
  sparkline: number[];
}

export interface BankCard {
  id: string;
  bank: string;
  holder: string;
  lastFour: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  assetId: string;
  createdAt: string;
  title: string;
  detail: string;
  fee?: number;
  fromAssetId?: string;
  toAssetId?: string;
  fromAmount?: number;
  toAmount?: number;
}

export interface LedgerState {
  assets: Asset[];
  tomanBalance: number;
  cards: BankCard[];
  transactions: Transaction[];
  unit: CurrencyUnit;
  balanceHidden: boolean;
}

export type LedgerAction =
  | { type: 'unit/changed'; unit: CurrencyUnit }
  | { type: 'balance/toggled' }
  | { type: 'transaction/recorded'; transaction: Transaction }
  | { type: 'transaction/completed'; transaction: Transaction }
  | { type: 'cards/updated'; cards: BankCard[] };

const initialAssets: Asset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'بیت‌کوین',
    balance: 0.00035,
    priceToman: 4_800_000_000,
    dailyChange: -2.4,
    color: '#f7931a',
    sparkline: [34, 42, 36, 48, 45, 51, 44, 58, 52, 61, 47, 39, 30, 33, 23],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'اتریوم',
    balance: 0.035,
    priceToman: 110_000_000,
    dailyChange: 2.6,
    color: '#a7b4d5',
    sparkline: [27, 33, 30, 41, 39, 49, 45, 58, 55, 63, 61, 73, 70, 82],
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'تتر',
    balance: 100.7,
    priceToman: 100_000,
    dailyChange: 0.08,
    color: '#26a17b',
    sparkline: [50, 48, 51, 50, 53, 49, 51, 52, 50, 54, 51, 53, 52, 56],
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'سولانا',
    balance: 0.04,
    priceToman: 110_000_000,
    dailyChange: 4.8,
    color: '#8d6cff',
    sparkline: [22, 34, 30, 44, 40, 56, 50, 60, 57, 70, 66, 80, 73, 88],
  },
];

export function createInitialLedger(): LedgerState {
  return {
    assets: initialAssets.map((asset) => ({ ...asset, sparkline: [...asset.sparkline] })),
    tomanBalance: 105_450_000,
    cards: [
      {
        id: 'card-4821',
        bank: 'بانک سامان',
        holder: 'علی رضایی',
        lastFour: '۴۸۲۱',
        isDefault: true,
      },
      {
        id: 'card-1936',
        bank: 'بانک ملت',
        holder: 'علی رضایی',
        lastFour: '۱۹۳۶',
        isDefault: false,
      },
    ],
    transactions: [
      {
        id: 'tx-seed-1',
        type: 'trade',
        status: 'success',
        amount: 0.0002,
        assetId: 'btc',
        createdAt: '2026-10-03T11:30:00.000Z',
        title: 'خرید بیت‌کوین',
        detail: 'معامله آنی',
      },
      {
        id: 'tx-seed-2',
        type: 'deposit_toman',
        status: 'success',
        amount: 5_000_000,
        assetId: 'toman',
        createdAt: '2026-10-02T09:10:00.000Z',
        title: 'واریز تومان',
        detail: 'کارت سامان •• ۴۸۲۱',
      },
    ],
    unit: 'toman',
    balanceHidden: false,
  };
}

export function ledgerReducer(state: LedgerState, action: LedgerAction): LedgerState {
  switch (action.type) {
    case 'unit/changed':
      return { ...state, unit: action.unit };
    case 'balance/toggled':
      return { ...state, balanceHidden: !state.balanceHidden };
    case 'transaction/recorded':
      return { ...state, transactions: prependTransaction(state, action.transaction) };
    case 'transaction/completed':
      return applyCompletedTransaction(state, action.transaction);
    case 'cards/updated':
      return { ...state, cards: action.cards };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

function applyCompletedTransaction(state: LedgerState, transaction: Transaction): LedgerState {
  if (transaction.status !== 'success' || transaction.amount <= 0) return state;

  switch (transaction.type) {
    case 'deposit_toman':
      return {
        ...state,
        tomanBalance: state.tomanBalance + transaction.amount,
        transactions: prependTransaction(state, transaction),
      };
    case 'withdraw_toman':
      if (state.tomanBalance < transaction.amount + (transaction.fee ?? 0)) return state;
      return {
        ...state,
        tomanBalance: state.tomanBalance - transaction.amount - (transaction.fee ?? 0),
        transactions: prependTransaction(state, transaction),
      };
    case 'deposit_crypto':
      return updateAssetBalance(state, transaction, transaction.amount);
    case 'withdraw_crypto':
      return updateAssetBalance(state, transaction, -transaction.amount - (transaction.fee ?? 0));
    case 'trade': {
      const fromId = transaction.fromAssetId;
      const toId = transaction.toAssetId;
      const fromAmount = transaction.fromAmount ?? 0;
      const toAmount = transaction.toAmount ?? 0;
      if (!fromId || !toId || fromAmount <= 0 || toAmount <= 0 || fromId === toId) return state;
      const from = state.assets.find((asset) => asset.id === fromId);
      const to = state.assets.find((asset) => asset.id === toId);
      if (!from || !to || from.balance < fromAmount) return state;
      return {
        ...state,
        assets: state.assets.map((asset) => {
          if (asset.id === fromId) return { ...asset, balance: roundAssetBalance(asset.balance - fromAmount) };
          if (asset.id === toId) return { ...asset, balance: roundAssetBalance(asset.balance + toAmount) };
          return asset;
        }),
        transactions: prependTransaction(state, transaction),
      };
    }
  }
}

function updateAssetBalance(
  state: LedgerState,
  transaction: Transaction,
  delta: number,
): LedgerState {
  const asset = state.assets.find((item) => item.id === transaction.assetId);
  if (!asset || asset.balance + delta < 0) return state;
  return {
    ...state,
    assets: state.assets.map((item) =>
      item.id === transaction.assetId ? { ...item, balance: roundAssetBalance(item.balance + delta) } : item,
    ),
    transactions: prependTransaction(state, transaction),
  };
}

function roundAssetBalance(value: number): number {
  return Math.round((value + Number.EPSILON) * 1e12) / 1e12;
}

function prependTransaction(state: LedgerState, transaction: Transaction): Transaction[] {
  return [transaction, ...state.transactions.filter((item) => item.id !== transaction.id)];
}

const digitMap: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit)
    .replace(/[٬,\s]/g, '')
    .replace(/٫/g, '.');
}

export function parseAmount(value: string): number {
  const normalized = normalizeDigits(value);
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function validateAmount(value: string, available: number, minimum = 1): string | null {
  if (!value.trim()) return 'required';
  const amount = parseAmount(value);
  if (!Number.isFinite(amount)) return 'invalid';
  if (amount < minimum) return 'minimum';
  if (amount > available) return 'insufficient';
  return null;
}

export function formatFaNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

export function formatToman(value: number): string {
  return `${formatFaNumber(value)} تومان`;
}

export function formatCrypto(value: number): string {
  return new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 8,
    useGrouping: false,
  }).format(value);
}

export function assetValueToman(asset: Asset): number {
  return asset.balance * asset.priceToman;
}

export function totalValueToman(state: LedgerState): number {
  return state.tomanBalance + state.assets.reduce((total, asset) => total + assetValueToman(asset), 0);
}

export function availableValueToman(state: LedgerState): number {
  return state.tomanBalance;
}
