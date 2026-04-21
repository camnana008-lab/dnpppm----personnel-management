import { GoogleGenAI } from '@google/genai';
import type { AIAnalysisResult, ForexPair, TradingSignal } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function getClient() {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set.');
  return new GoogleGenAI({ apiKey: API_KEY });
}

export async function analyzeMarket(
  pairs: ForexPair[],
  signals: TradingSignal[]
): Promise<AIAnalysisResult> {
  const ai = getClient();

  const pairsText = pairs
    .map((p) => `${p.symbol}: ${p.bid.toFixed(4)} (${p.changePercent >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%)`)
    .join('\n');

  const activeSignals = signals.filter((s) => s.status === 'active');
  const signalsText = activeSignals
    .map((s) => `${s.pair} ${s.type} @ ${s.entryPrice.toFixed(4)} — confidence ${s.confidence}%`)
    .join('\n');

  const prompt = `You are an expert Forex market analyst. Analyze the following real-time Forex market data and active trading signals, then provide a structured JSON market analysis.

CURRENT FOREX PAIRS:
${pairsText}

ACTIVE TRADING SIGNALS:
${signalsText || 'None'}

Respond ONLY with valid JSON matching this schema exactly:
{
  "summary": "string (2-3 sentences)",
  "sentiment": "bullish" | "bearish" | "neutral",
  "keyFactors": ["string", "string", "string"],
  "recommendation": "string (actionable advice)",
  "riskLevel": "low" | "medium" | "high",
  "targetPairs": [
    { "pair": "string", "direction": "BUY" | "SELL", "confidence": number_0_to_100 }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON.');
  return JSON.parse(jsonMatch[0]) as AIAnalysisResult;
}

export async function generateSignalReasoning(
  pair: string,
  type: 'BUY' | 'SELL',
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): Promise<string> {
  const ai = getClient();

  const prompt = `You are a professional Forex trading analyst. Provide a brief, concise trading rationale (2-3 sentences max) for the following signal:

Pair: ${pair}
Signal: ${type}
Entry: ${entryPrice.toFixed(4)}
Stop Loss: ${stopLoss.toFixed(4)}
Take Profit: ${takeProfit.toFixed(4)}
Risk/Reward: 1:${((Math.abs(takeProfit - entryPrice) / Math.abs(stopLoss - entryPrice))).toFixed(1)}

Respond with ONLY the rationale text, no JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  return response.text?.trim() ?? 'AI analysis unavailable.';
}
