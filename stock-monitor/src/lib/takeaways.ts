import type { Quote } from '../types/market';
import { formatCurrency, formatPercent } from './format';

/**
 * Turns a quote into a few plain-English bullet points summarizing today's action.
 * Pure function — easy to test and reuse.
 */
export function buildTakeaways(quote: Quote): string[] {
  const out: string[] = [];
  const { symbol, currency } = quote;

  // 1) Direction + magnitude.
  if (quote.change > 0) {
    out.push(
      `${symbol} is up ${formatPercent(quote.changePercent)} (${formatCurrency(quote.change, currency)}) today.`,
    );
  } else if (quote.change < 0) {
    out.push(
      `${symbol} is down ${formatPercent(quote.changePercent)} (${formatCurrency(Math.abs(quote.change), currency)}) today.`,
    );
  } else {
    out.push(`${symbol} is roughly flat today.`);
  }

  // 2) Where it sits within the day's range.
  const range = quote.dayHigh - quote.dayLow;
  if (range > 0) {
    const positionInRange = (quote.price - quote.dayLow) / range;
    if (positionInRange >= 0.85) {
      out.push('Trading near its high for the day.');
    } else if (positionInRange <= 0.15) {
      out.push('Trading near its low for the day.');
    } else {
      out.push('Trading in the middle of its daily range.');
    }
  }

  // 3) Proximity to 52-week extremes.
  if (quote.fiftyTwoWeekHigh != null && quote.fiftyTwoWeekLow != null) {
    const span = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
    if (span > 0) {
      const pct = (quote.price - quote.fiftyTwoWeekLow) / span;
      if (pct >= 0.95) {
        out.push('Close to its 52-week high.');
      } else if (pct <= 0.05) {
        out.push('Close to its 52-week low.');
      }
    }
  }

  // 4) Market status.
  out.push(
    quote.isMarketOpen
      ? 'The market is currently open, so this can still move.'
      : 'The market is closed; this reflects the latest available data.',
  );

  return out;
}
