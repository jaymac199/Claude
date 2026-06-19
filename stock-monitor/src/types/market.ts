export interface StockConfig {
  symbol: string;
  name: string;
  currency: string;
  /** Base price used by the demo provider only. */
  seed: number;
  /** Accent color used for this stock's chart line. */
  accent: string;
}

/** Selectable chart time ranges. */
export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y';

export const TIME_RANGES: TimeRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];

/** A single OHLC data point. `time` is an epoch in milliseconds. */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Normalized snapshot quote for one symbol. */
export interface Quote {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  isMarketOpen: boolean;
  /** Epoch ms of the quote's own timestamp (may lag now if delayed). */
  timestamp: number;
}

/**
 * Where the currently displayed data came from.
 * - `live`   : fresh data from the configured provider
 * - `delayed`: provider data, but the market is closed / timestamp is stale
 * - `mock`   : built-in demo data (no API key, or provider fell back)
 * - `error`  : last fetch failed and nothing usable is available
 */
export type DataStatus = 'live' | 'delayed' | 'mock' | 'error';

/** A pluggable market-data source. Add a new provider by implementing this. */
export interface MarketDataProvider {
  readonly id: string;
  getQuote(symbol: string): Promise<Quote>;
  getTimeSeries(symbol: string, range: TimeRange): Promise<Candle[]>;
}

/** Typed error so callers can distinguish rate-limits from generic failures. */
export class MarketDataError extends Error {
  constructor(
    message: string,
    public readonly kind: 'rate-limit' | 'auth' | 'not-found' | 'network' | 'unknown' = 'unknown',
  ) {
    super(message);
    this.name = 'MarketDataError';
  }
}
