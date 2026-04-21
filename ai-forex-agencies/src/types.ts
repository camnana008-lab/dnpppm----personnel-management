export type Page = 'dashboard' | 'agencies' | 'market' | 'signals' | 'ai-analysis' | 'portfolio';

export interface Agency {
  id: string;
  name: string;
  country: string;
  licenseNumber: string;
  status: 'active' | 'suspended' | 'pending';
  specialization: string[];
  aum: number;
  winRate: number;
  totalTrades: number;
  monthlyReturn: number;
  joinedDate: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

export interface ForexPair {
  symbol: string;
  base: string;
  quote: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  timeframe: string;
  reason: string;
  generatedAt: string;
  status: 'active' | 'closed' | 'cancelled';
  agencyId?: string;
}

export interface PortfolioEntry {
  agencyId: string;
  agencyName: string;
  allocation: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  trades: number;
  winRate: number;
}

export interface AIAnalysisResult {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  targetPairs: { pair: string; direction: string; confidence: number }[];
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
  publishedAt: string;
}
