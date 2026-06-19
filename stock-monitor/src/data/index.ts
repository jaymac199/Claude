import type { Candle, DataStatus, MarketDataProvider, Quote, TimeRange } from '../types/market';
import { MarketDataError } from '../types/market';
import { mockProvider } from './mockProvider';
import { normalizeCandles, normalizeQuote } from './normalize';
import { createTwelveDataProvider } from './twelveData';

/**
 * Orchestration layer between the UI and the raw providers. Responsibilities:
 *  - pick the live provider when an API key is present, else the demo provider;
 *  - cache responses in localStorage with a short TTL to respect rate limits;
 *  - fall back to demo data (never a blank dashboard) when a live call fails,
 *    surfacing a human-readable reason.
 */

const API_KEY = import.meta.env.VITE_MARKET_DATA_API_KEY?.trim();

const liveProvider: MarketDataProvider | null = API_KEY
  ? createTwelveDataProvider(API_KEY)
  : null;

export const hasLiveProvider = liveProvider !== null;
export const activeProviderId = liveProvider?.id ?? mockProvider.id;

const QUOTE_TTL_MS = 30_000;
const SERIES_TTL_MS = 5 * 60_000;
const STALE_AFTER_MS = 20 * 60_000;

export interface QuoteResult {
  quote: Quote;
  status: DataStatus;
  /** Set when live data failed and we fell back to demo data. */
  error?: string;
}

export interface SeriesResult {
  candles: Candle[];
  status: DataStatus;
  error?: string;
}

// --- localStorage cache ---------------------------------------------------

interface CacheEntry<T> {
  at: number;
  value: T;
}

function cacheGet<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.at > ttl) return null;
    return entry.value;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), value } satisfies CacheEntry<T>));
  } catch {
    // Storage full or unavailable — non-fatal.
  }
}

function quoteStatus(quote: Quote): DataStatus {
  if (!quote.isMarketOpen) return 'delayed';
  if (Date.now() - quote.timestamp > STALE_AFTER_MS) return 'delayed';
  return 'live';
}

function describe(err: unknown): string {
  if (err instanceof MarketDataError) {
    switch (err.kind) {
      case 'rate-limit':
        return 'Live data rate limit reached — showing demo data. Try again shortly.';
      case 'auth':
        return 'Invalid API key — showing demo data. Check VITE_MARKET_DATA_API_KEY.';
      case 'network':
        return 'Network error reaching the data provider — showing demo data.';
      default:
        return `${err.message} — showing demo data.`;
    }
  }
  return 'Live data unavailable — showing demo data.';
}

// --- public API -----------------------------------------------------------

async function mockQuote(symbol: string): Promise<Quote> {
  return normalizeQuote(await mockProvider.getQuote(symbol));
}

export async function fetchQuote(symbol: string, force = false): Promise<QuoteResult> {
  if (!liveProvider) {
    return { quote: await mockQuote(symbol), status: 'mock' };
  }

  const cacheKey = `cache:quote:${activeProviderId}:${symbol}`;
  if (!force) {
    const cached = cacheGet<Quote>(cacheKey, QUOTE_TTL_MS);
    if (cached) return { quote: cached, status: quoteStatus(cached) };
  }

  try {
    const quote = normalizeQuote(await liveProvider.getQuote(symbol));
    cacheSet(cacheKey, quote);
    return { quote, status: quoteStatus(quote) };
  } catch (err) {
    return { quote: await mockQuote(symbol), status: 'mock', error: describe(err) };
  }
}

async function mockSeries(symbol: string, range: TimeRange): Promise<Candle[]> {
  return normalizeCandles(await mockProvider.getTimeSeries(symbol, range));
}

export async function fetchSeries(
  symbol: string,
  range: TimeRange,
  force = false,
): Promise<SeriesResult> {
  if (!liveProvider) {
    return { candles: await mockSeries(symbol, range), status: 'mock' };
  }

  const cacheKey = `cache:series:${activeProviderId}:${symbol}:${range}`;
  if (!force) {
    const cached = cacheGet<Candle[]>(cacheKey, SERIES_TTL_MS);
    if (cached) return { candles: cached, status: 'live' };
  }

  try {
    const candles = normalizeCandles(await liveProvider.getTimeSeries(symbol, range));
    cacheSet(cacheKey, candles);
    return { candles, status: 'live' };
  } catch (err) {
    return {
      candles: await mockSeries(symbol, range),
      status: 'mock',
      error: describe(err),
    };
  }
}
