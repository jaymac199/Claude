import type { Candle, MarketDataProvider, Quote, TimeRange } from '../types/market';
import { getStock } from '../config/stocks';

/**
 * Deterministic demo provider. Generates a seeded random-walk price series so the
 * full UI can be previewed without an API key. Values are synthetic — never treat
 * them as real market data (the UI labels this state as "Demo").
 */

// Small, fast seeded PRNG (mulberry32) so the demo data is stable across reloads.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RangeShape {
  points: number;
  stepMs: number;
  /** Per-step volatility as a fraction of price. */
  vol: number;
}

function rangeShape(range: TimeRange): RangeShape {
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  switch (range) {
    case '1D':
      return { points: 78, stepMs: 5 * MIN, vol: 0.0025 };
    case '5D':
      return { points: 65, stepMs: 30 * MIN, vol: 0.004 };
    case '1M':
      return { points: 22, stepMs: DAY, vol: 0.012 };
    case '6M':
      return { points: 130, stepMs: DAY, vol: 0.014 };
    case 'YTD':
      return { points: 120, stepMs: DAY, vol: 0.015 };
    case '1Y':
      return { points: 252, stepMs: DAY, vol: 0.016 };
    case '5Y':
      return { points: 260, stepMs: 7 * DAY, vol: 0.03 };
  }
}

function buildSeries(symbol: string, range: TimeRange): Candle[] {
  const stock = getStock(symbol);
  const base = stock?.seed ?? 100;
  const { points, stepMs, vol } = rangeShape(range);
  // Vary the seed per range so different ranges don't look identical.
  const rand = mulberry32((stock?.seed ?? 100) + range.length * 7919);

  const candles: Candle[] = [];
  const now = Date.now();
  let price = base * (0.85 + rand() * 0.1); // start somewhat below "today"

  // Gentle upward drift so the series trends toward the current price over time.
  const drift = (base - price) / points / base;

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * stepMs;
    const shock = (rand() - 0.5) * 2 * vol;
    const open = price;
    price = Math.max(1, price * (1 + drift + shock));
    const close = price;
    const high = Math.max(open, close) * (1 + rand() * vol);
    const low = Math.min(open, close) * (1 - rand() * vol);
    const volume = Math.round((0.6 + rand() * 0.8) * 1_000_000);
    candles.push({ time, open, high, low, close, volume });
  }
  return candles;
}

async function delay<T>(value: T): Promise<T> {
  // Tiny delay so loading states are observable in the demo.
  await new Promise((r) => setTimeout(r, 250 + Math.random() * 250));
  return value;
}

export const mockProvider: MarketDataProvider = {
  id: 'mock',

  async getQuote(symbol: string): Promise<Quote> {
    const stock = getStock(symbol);
    const intraday = buildSeries(symbol, '1D');
    const yearly = buildSeries(symbol, '1Y');
    // Seeded so the demo quote is stable across refreshes (no flicker).
    const rand = mulberry32((stock?.seed ?? 100) * 31 + 7);

    const price = intraday[intraday.length - 1].close;
    const open = intraday[0].open;
    const previousClose = open * (1 - (rand() - 0.5) * 0.01);
    const change = price - previousClose;
    const dayHigh = Math.max(...intraday.map((c) => c.high));
    const dayLow = Math.min(...intraday.map((c) => c.low));
    const volume = intraday.reduce((sum, c) => sum + (c.volume ?? 0), 0);
    const sharesOutstanding = (stock?.seed ?? 100) * 250_000; // arbitrary but stable

    return delay<Quote>({
      symbol,
      name: stock?.name ?? symbol,
      currency: stock?.currency ?? 'USD',
      price,
      change,
      changePercent: (change / previousClose) * 100,
      open,
      previousClose,
      dayHigh,
      dayLow,
      volume,
      marketCap: price * sharesOutstanding,
      fiftyTwoWeekHigh: Math.max(...yearly.map((c) => c.high)),
      fiftyTwoWeekLow: Math.min(...yearly.map((c) => c.low)),
      isMarketOpen: isLikelyMarketOpen(),
      timestamp: Date.now(),
    });
  },

  async getTimeSeries(symbol: string, range: TimeRange): Promise<Candle[]> {
    return delay(buildSeries(symbol, range));
  },
};

/** Rough US-market heuristic (Mon–Fri, 9:30–16:00 ET) for the demo badge. */
function isLikelyMarketOpen(): boolean {
  const now = new Date();
  // Convert to US Eastern time without extra deps.
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = et.getHours() * 60 + et.getMinutes();
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}
