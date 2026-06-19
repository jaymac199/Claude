import type { StockConfig } from '../types/market';

/**
 * The list of tracked stocks. To monitor another company, add one entry here —
 * cards, charts, comparison, stats, and notes all derive from this array.
 *
 * `seed` is only used by the mock/demo provider to generate a realistic-looking
 * synthetic price series; it has no effect on live data.
 */
export const STOCKS: StockConfig[] = [
  { symbol: 'MELI', name: 'Mercado Libre', currency: 'USD', seed: 1850, accent: '#ffe600' },
  { symbol: 'SMCI', name: 'Super Micro Computer', currency: 'USD', seed: 42, accent: '#22d3ee' },
];

export const SYMBOLS = STOCKS.map((s) => s.symbol);

export function getStock(symbol: string): StockConfig | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
