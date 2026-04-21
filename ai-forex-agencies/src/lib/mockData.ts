import { Agency, ForexPair, TradingSignal, PortfolioEntry, MarketNews, CandleData } from '../types';
import { randomBetween, randomInt } from './utils';

export const MOCK_AGENCIES: Agency[] = [
  {
    id: 'ag1', name: 'AlphaWave Capital', country: 'United Kingdom', licenseNumber: 'FCA-123456',
    status: 'active', specialization: ['EUR/USD', 'GBP/USD', 'Majors'],
    aum: 48_500_000, winRate: 68.4, totalTrades: 12430, monthlyReturn: 3.2, joinedDate: '2021-03-15',
    contact: { email: 'info@alphawave.co.uk', phone: '+44 20 7946 0958', website: 'alphawave.co.uk' },
  },
  {
    id: 'ag2', name: 'Pacific Forex Solutions', country: 'Australia', licenseNumber: 'ASIC-789012',
    status: 'active', specialization: ['AUD/USD', 'NZD/USD', 'Asia-Pacific'],
    aum: 22_100_000, winRate: 61.7, totalTrades: 8902, monthlyReturn: 2.1, joinedDate: '2022-07-08',
    contact: { email: 'trade@pacificforex.au', phone: '+61 2 9374 4000', website: 'pacificforex.au' },
  },
  {
    id: 'ag3', name: 'Nordic Quant Trading', country: 'Sweden', licenseNumber: 'SFSA-345678',
    status: 'active', specialization: ['EUR crosses', 'Algorithmic', 'High-Frequency'],
    aum: 91_200_000, winRate: 74.2, totalTrades: 287_540, monthlyReturn: 5.8, joinedDate: '2019-11-22',
    contact: { email: 'ops@nordicquant.se', phone: '+46 8 400 12345', website: 'nordicquant.se' },
  },
  {
    id: 'ag4', name: 'Meridian FX Group', country: 'Singapore', licenseNumber: 'MAS-901234',
    status: 'suspended', specialization: ['USD/JPY', 'USD/SGD', 'Emerging Markets'],
    aum: 15_300_000, winRate: 55.1, totalTrades: 4210, monthlyReturn: -1.4, joinedDate: '2023-01-30',
    contact: { email: 'compliance@meridianfx.sg', phone: '+65 6221 8800', website: 'meridianfx.sg' },
  },
  {
    id: 'ag5', name: 'Delphi Alpha Partners', country: 'United States', licenseNumber: 'NFA-567890',
    status: 'pending', specialization: ['USD Majors', 'Commodities FX', 'Swing Trading'],
    aum: 5_800_000, winRate: 63.0, totalTrades: 1845, monthlyReturn: 2.9, joinedDate: '2024-09-01',
    contact: { email: 'hello@delphialpha.com', phone: '+1 212 555 0197', website: 'delphialpha.com' },
  },
];

export const FOREX_PAIRS: ForexPair[] = [
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', bid: 1.0892, ask: 1.0894, spread: 0.0002, change: 0.0023, changePercent: 0.21, high: 1.0910, low: 1.0855, volume: 98_400 },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', bid: 1.2741, ask: 1.2743, spread: 0.0002, change: -0.0018, changePercent: -0.14, high: 1.2785, low: 1.2712, volume: 65_200 },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', bid: 153.42, ask: 153.44, spread: 0.02, change: 0.48, changePercent: 0.31, high: 153.89, low: 152.95, volume: 112_000 },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', bid: 0.9042, ask: 0.9044, spread: 0.0002, change: -0.0009, changePercent: -0.10, high: 0.9063, low: 0.9028, volume: 31_500 },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', bid: 0.6518, ask: 0.6520, spread: 0.0002, change: 0.0012, changePercent: 0.18, high: 0.6544, low: 0.6497, volume: 44_800 },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', bid: 1.3624, ask: 1.3626, spread: 0.0002, change: 0.0031, changePercent: 0.23, high: 1.3648, low: 1.3590, volume: 38_200 },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', bid: 0.5941, ask: 0.5943, spread: 0.0002, change: -0.0008, changePercent: -0.13, high: 0.5965, low: 0.5921, volume: 18_700 },
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', bid: 0.8547, ask: 0.8549, spread: 0.0002, change: 0.0005, changePercent: 0.06, high: 0.8561, low: 0.8534, volume: 22_100 },
];

export const MOCK_SIGNALS: TradingSignal[] = [
  {
    id: 'sig1', pair: 'EUR/USD', type: 'BUY', entryPrice: 1.0892, stopLoss: 1.0855, takeProfit: 1.0970,
    confidence: 82, timeframe: '4H', generatedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'active', agencyId: 'ag3',
    reason: 'Bullish breakout above key resistance. RSI divergence on 4H confirms momentum. ECB dovish tone priced in.',
  },
  {
    id: 'sig2', pair: 'GBP/USD', type: 'SELL', entryPrice: 1.2741, stopLoss: 1.2790, takeProfit: 1.2640,
    confidence: 71, timeframe: '1H', generatedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'active', agencyId: 'ag1',
    reason: 'Double top formation on 1H chart. UK CPI miss weighing on pound. Bearish engulfing candle confirms.',
  },
  {
    id: 'sig3', pair: 'USD/JPY', type: 'BUY', entryPrice: 153.42, stopLoss: 152.80, takeProfit: 154.50,
    confidence: 76, timeframe: '1D', generatedAt: new Date(Date.now() - 14400000).toISOString(),
    status: 'active', agencyId: 'ag3',
    reason: 'BoJ maintaining ultra-loose policy. USD strength on NFP beat. Clear uptrend structure intact.',
  },
  {
    id: 'sig4', pair: 'AUD/USD', type: 'SELL', entryPrice: 0.6518, stopLoss: 0.6555, takeProfit: 0.6430,
    confidence: 65, timeframe: '4H', generatedAt: new Date(Date.now() - 21600000).toISOString(),
    status: 'closed', agencyId: 'ag2',
    reason: 'China slowdown concerns dragging AUD. Bearish channel continuation. RBA rate cut expectations.',
  },
];

export const MOCK_PORTFOLIO: PortfolioEntry[] = [
  { agencyId: 'ag1', agencyName: 'AlphaWave Capital', allocation: 35, invested: 350_000, currentValue: 381_200, pnl: 31_200, pnlPercent: 8.91, trades: 142, winRate: 68.4 },
  { agencyId: 'ag3', agencyName: 'Nordic Quant Trading', allocation: 45, invested: 450_000, currentValue: 476_100, pnl: 26_100, pnlPercent: 5.80, trades: 891, winRate: 74.2 },
  { agencyId: 'ag2', agencyName: 'Pacific Forex Solutions', allocation: 20, invested: 200_000, currentValue: 204_200, pnl: 4_200, pnlPercent: 2.10, trades: 87, winRate: 61.7 },
];

export const MOCK_NEWS: MarketNews[] = [
  { id: 'n1', title: 'Fed Signals Patience on Rate Cuts Amid Inflation Stickiness', summary: 'Federal Reserve officials indicate no rush to cut rates as PCE inflation remains above 2% target.', impact: 'high', currency: 'USD', publishedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n2', title: 'ECB Lagarde: Data-Dependent Approach to Monetary Policy', summary: 'ECB President reaffirms commitment to evidence-based decisions as eurozone growth slows.', impact: 'high', currency: 'EUR', publishedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', title: 'UK Retail Sales Beat Expectations in March', summary: 'UK retail sales rose 0.4% MoM, outperforming 0.1% consensus, boosting GBP.', impact: 'medium', currency: 'GBP', publishedAt: new Date(Date.now() - 5400000).toISOString() },
  { id: 'n4', title: 'BoJ Holds Rates, Signals Gradual Normalization Path', summary: 'Bank of Japan maintains negative rate policy but signals readiness to exit if inflation persists.', impact: 'high', currency: 'JPY', publishedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n5', title: 'Australian CPI Surprises to the Upside at 3.4%', summary: 'Stronger-than-expected inflation data pushes RBA rate cut expectations further out.', impact: 'medium', currency: 'AUD', publishedAt: new Date(Date.now() - 10800000).toISOString() },
];

export function generateCandleData(basePrice: number, count = 50): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = randomBetween(-0.003, 0.003) * basePrice;
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(0, 0.002) * basePrice;
    const low = Math.min(open, close) - randomBetween(0, 0.002) * basePrice;
    const volume = randomInt(10_000, 120_000);
    candles.push({
      time: new Date(now - i * 4 * 3600_000).toISOString(),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume,
    });
    price = close;
  }
  return candles;
}

export function liveTickForexPairs(pairs: ForexPair[]): ForexPair[] {
  return pairs.map((p) => {
    const delta = randomBetween(-0.0008, 0.0008) * p.bid;
    const newBid = parseFloat((p.bid + delta).toFixed(p.symbol.includes('JPY') ? 2 : 4));
    const newAsk = parseFloat((newBid + p.spread).toFixed(p.symbol.includes('JPY') ? 2 : 4));
    const newChange = parseFloat((p.change + delta).toFixed(p.symbol.includes('JPY') ? 2 : 4));
    const newChangePct = parseFloat(((newChange / (newBid - newChange)) * 100).toFixed(2));
    return { ...p, bid: newBid, ask: newAsk, change: newChange, changePercent: newChangePct };
  });
}
