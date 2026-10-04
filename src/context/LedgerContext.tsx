import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { createInitialLedger, ledgerReducer, type LedgerAction, type LedgerState } from '../domain/ledger';

interface LedgerContextValue {
  state: LedgerState;
  dispatch: Dispatch<LedgerAction>;
}

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ledgerReducer, undefined, createInitialLedger);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const context = useContext(LedgerContext);
  if (!context) throw new Error('useLedger must be used inside LedgerProvider');
  return context;
}
