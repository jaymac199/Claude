import type { Candle, Quote } from '../types/market';

/**
 * Final normalization pass applied to EVERY provider's output (live and mock alike)
 * before it reaches the cache or UI. This is what makes the two sources truly
 * interchangeable: identical field set, identical numeric precision, identical
 * candle ordering, and safe defaults for missing/NaN values.
 */

function round(n: number, dp = 2): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function roundOpt(n: number | null | undefined, dp = 2): number | null {
  if (n == null || !Number.isFinite(n)) return null;
  return round(n, dp);
}

export function normalizeQuote(q: Quote): Quote {
  return {
    symbol: q.symbol,
    name: q.name,
    currency: q.currency || 'USD',
    price: round(q.price),
    change: round(q.change),
    changePercent: round(q.changePercent),
    open: round(q.open),
    previousClose: round(q.previousClose),
    dayHigh: round(q.dayHigh),
    dayLow: round(q.dayLow),
    volume: Math.max(0, Math.round(q.volume || 0)),
    marketCap: q.marketCap != null && Number.isFinite(q.marketCap) ? Math.round(q.marketCap) : null,
    fiftyTwoWeekHigh: roundOpt(q.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: roundOpt(q.fiftyTwoWeekLow),
    isMarketOpen: Boolean(q.isMarketOpen),
    timestamp: Number.isFinite(q.timestamp) ? q.timestamp : Date.now(),
  };
}

export function normalizeCandles(candles: Candle[]): Candle[] {
  // De-dupe by timestamp (last write wins) and guarantee chronological order.
  const byTime = new Map<number, Candle>();
  for (const c of candles) {
    if (!Number.isFinite(c.time) || !Number.isFinite(c.close)) continue;
    byTime.set(c.time, {
      time: c.time,
      open: round(c.open),
      high: round(c.high),
      low: round(c.low),
      close: round(c.close),
      volume: c.volume == null ? undefined : Math.max(0, Math.round(c.volume)),
    });
  }
  return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
}
