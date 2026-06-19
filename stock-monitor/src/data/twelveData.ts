import {
  MarketDataError,
  type Candle,
  type MarketDataProvider,
  type Quote,
  type TimeRange,
} from '../types/market';
import { getStock } from '../config/stocks';

/**
 * Live adapter for Twelve Data (https://twelvedata.com/).
 *
 * Free tier: 800 requests/day, 8 requests/min. We keep request counts low by
 * fetching one quote + one time-series per symbol and relying on the caching layer
 * in ./index.ts. Market cap is fetched best-effort from /statistics and degrades to
 * null when unavailable on the free plan.
 */

const BASE_URL = 'https://api.twelvedata.com';

interface TwelveDataParams {
  interval: string;
  outputsize: number;
}

function rangeToParams(range: TimeRange): TwelveDataParams {
  switch (range) {
    case '1D':
      return { interval: '5min', outputsize: 78 };
    case '5D':
      return { interval: '30min', outputsize: 65 };
    case '1M':
      return { interval: '1day', outputsize: 23 };
    case '6M':
      return { interval: '1day', outputsize: 130 };
    case 'YTD': {
      const start = new Date(new Date().getFullYear(), 0, 1);
      const days = Math.ceil((Date.now() - start.getTime()) / 86_400_000);
      return { interval: '1day', outputsize: Math.min(Math.max(days, 5), 366) };
    }
    case '1Y':
      return { interval: '1day', outputsize: 252 };
    case '5Y':
      return { interval: '1week', outputsize: 260 };
  }
}

async function request<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const query = new URLSearchParams({ ...params, apikey: apiKey }).toString();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}?${query}`);
  } catch (err) {
    throw new MarketDataError(`Network error contacting Twelve Data: ${String(err)}`, 'network');
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new MarketDataError('Twelve Data rate limit reached.', 'rate-limit');
    }
    if (res.status === 401) {
      throw new MarketDataError('Invalid Twelve Data API key.', 'auth');
    }
    throw new MarketDataError(`Twelve Data request failed (${res.status}).`, 'unknown');
  }

  const json = (await res.json()) as T & { status?: string; code?: number; message?: string };

  // Twelve Data returns HTTP 200 with a JSON error body on logical failures.
  if (json && json.status === 'error') {
    const code = json.code;
    const message = json.message ?? 'Unknown Twelve Data error.';
    if (code === 429) throw new MarketDataError(message, 'rate-limit');
    if (code === 401) throw new MarketDataError(message, 'auth');
    if (code === 404) throw new MarketDataError(message, 'not-found');
    throw new MarketDataError(message, 'unknown');
  }
  return json;
}

interface TDQuote {
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume: string;
  is_market_open: boolean;
  timestamp: number;
  fifty_two_week?: { low: string; high: string };
}

interface TDTimeSeries {
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
}

interface TDStatistics {
  statistics?: {
    valuations_metrics?: { market_capitalization?: number | string };
  };
}

function num(value: string | number | undefined | null): number {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return n == null || Number.isNaN(n) ? 0 : n;
}

function optNum(value: string | number | undefined | null): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? null : n;
}

export function createTwelveDataProvider(apiKey: string): MarketDataProvider {
  return {
    id: 'twelvedata',

    async getQuote(symbol: string): Promise<Quote> {
      const stock = getStock(symbol);
      const q = await request<TDQuote>('/quote', { symbol }, apiKey);

      // Market cap is best-effort: it lives on a separate endpoint and may be
      // unavailable on the free tier. Never fail the whole quote over it.
      let marketCap: number | null = null;
      try {
        const stats = await request<TDStatistics>('/statistics', { symbol }, apiKey);
        marketCap = optNum(stats.statistics?.valuations_metrics?.market_capitalization ?? null);
      } catch {
        marketCap = null;
      }

      return {
        symbol,
        name: stock?.name ?? symbol,
        currency: stock?.currency ?? 'USD',
        price: num(q.close),
        change: num(q.change),
        changePercent: num(q.percent_change),
        open: num(q.open),
        previousClose: num(q.previous_close),
        dayHigh: num(q.high),
        dayLow: num(q.low),
        volume: num(q.volume),
        marketCap,
        fiftyTwoWeekHigh: optNum(q.fifty_two_week?.high),
        fiftyTwoWeekLow: optNum(q.fifty_two_week?.low),
        isMarketOpen: Boolean(q.is_market_open),
        timestamp: q.timestamp ? q.timestamp * 1000 : Date.now(),
      };
    },

    async getTimeSeries(symbol: string, range: TimeRange): Promise<Candle[]> {
      const { interval, outputsize } = rangeToParams(range);
      const data = await request<TDTimeSeries>(
        '/time_series',
        { symbol, interval, outputsize: String(outputsize) },
        apiKey,
      );

      // Twelve Data returns newest-first; reverse for chronological charts.
      return (data.values ?? [])
        .map((v) => ({
          time: new Date(v.datetime.replace(' ', 'T')).getTime(),
          open: num(v.open),
          high: num(v.high),
          low: num(v.low),
          close: num(v.close),
          volume: v.volume ? num(v.volume) : undefined,
        }))
        .sort((a, b) => a.time - b.time);
    },
  };
}
