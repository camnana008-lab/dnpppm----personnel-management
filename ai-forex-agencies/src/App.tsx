import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TickerTape from './components/TickerTape';
import Dashboard from './components/Dashboard';
import AgencyList from './components/AgencyList';
import MarketView from './components/MarketView';
import TradingSignals from './components/TradingSignals';
import AIAnalysis from './components/AIAnalysis';
import Portfolio from './components/Portfolio';
import { MOCK_AGENCIES, FOREX_PAIRS, MOCK_SIGNALS, MOCK_PORTFOLIO, MOCK_NEWS, liveTickForexPairs } from './lib/mockData';
import type { Page, ForexPair } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [pairs, setPairs] = useState<ForexPair[]>(FOREX_PAIRS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prev) => liveTickForexPairs(prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard agencies={MOCK_AGENCIES} pairs={pairs} signals={MOCK_SIGNALS} news={MOCK_NEWS} onNavigate={setPage} />;
      case 'agencies':
        return <AgencyList agencies={MOCK_AGENCIES} />;
      case 'market':
        return <MarketView pairs={pairs} />;
      case 'signals':
        return <TradingSignals signals={MOCK_SIGNALS} agencies={MOCK_AGENCIES} />;
      case 'ai-analysis':
        return <AIAnalysis pairs={pairs} signals={MOCK_SIGNALS} />;
      case 'portfolio':
        return <Portfolio portfolio={MOCK_PORTFOLIO} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation activePage={page} onNavigate={setPage} />
      <div className="ml-64 flex flex-col min-h-screen">
        <TickerTape pairs={pairs} />
        <main className="flex-1 p-6 max-w-7xl">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
