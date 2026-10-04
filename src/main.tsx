import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LedgerProvider } from './context/LedgerContext';
import { AssetDetailPage, MarketPage } from './pages/MarketPage';
import { MoneyFlowPage } from './pages/MoneyFlowPage';
import { CardsPage, ProfilePage, SettingsPage } from './pages/ProfilePages';
import { TradePage } from './pages/TradePage';
import { TransactionDetailPage, TransactionsPage } from './pages/TransactionsPage';
import { WalletPage } from './pages/WalletPage';
import { routeTransition } from './animation/motion-tokens';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user" transition={routeTransition}>
      <LedgerProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/wallet" replace />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/market" element={<MarketPage />} />
              <Route path="/market/:symbol" element={<AssetDetailPage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              <Route path="/deposit/crypto" element={<MoneyFlowPage />} />
              <Route path="/deposit/toman" element={<MoneyFlowPage />} />
              <Route path="/withdraw/crypto" element={<MoneyFlowPage />} />
              <Route path="/withdraw/toman" element={<MoneyFlowPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/cards" element={<CardsPage />} />
              <Route path="/profile/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/wallet" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LedgerProvider>
    </MotionConfig>
  </StrictMode>,
);
