import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import '@fontsource/inter/600.css';
import { MotionConfig } from 'motion/react';
import { lazy, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SolarProvider } from '@solar-icons/react/lib/SolarProvider';
import { AppShell } from './components/AppShell';
import { LedgerProvider } from './context/LedgerContext';
import { routeTransition } from './animation/motion-tokens';
import './style.css';

const WalletPage = lazy(() => import('./pages/WalletPage').then((module) => ({ default: module.WalletPage })));
const MarketPage = lazy(() => import('./pages/MarketPage').then((module) => ({ default: module.MarketPage })));
const AssetDetailPage = lazy(() => import('./pages/MarketPage').then((module) => ({ default: module.AssetDetailPage })));
const TradePage = lazy(() => import('./pages/TradePage').then((module) => ({ default: module.TradePage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })));
const TransactionDetailPage = lazy(() => import('./pages/TransactionsPage').then((module) => ({ default: module.TransactionDetailPage })));
const MoneyFlowPage = lazy(() => import('./pages/MoneyFlowPage').then((module) => ({ default: module.MoneyFlowPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePages').then((module) => ({ default: module.ProfilePage })));
const CardsPage = lazy(() => import('./pages/ProfilePages').then((module) => ({ default: module.CardsPage })));
const SettingsPage = lazy(() => import('./pages/ProfilePages').then((module) => ({ default: module.SettingsPage })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolarProvider strokeWidth={1.7}>
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
    </SolarProvider>
  </StrictMode>,
);
