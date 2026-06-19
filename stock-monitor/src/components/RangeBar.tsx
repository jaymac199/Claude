import { formatCurrency } from '../lib/format';

interface Props {
  label: string;
  low: number;
  high: number;
  value: number;
  currency: string;
}

/**
 * Compact bar showing where the current price sits between a low and a high
 * (e.g. the day's range or the 52-week range) — useful at a glance.
 */
export function RangeBar({ label, low, high, value, currency }: Props) {
  const span = high - low;
  const pct = span > 0 ? Math.min(100, Math.max(0, ((value - low) / span) * 100)) : 50;

  return (
    <div className="range-bar">
      <div className="range-bar__head">
        <span className="range-bar__label">{label}</span>
      </div>
      <div className="range-bar__track" role="img" aria-label={`${label}: ${formatCurrency(value, currency)} between ${formatCurrency(low, currency)} and ${formatCurrency(high, currency)}`}>
        <span className="range-bar__marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="range-bar__bounds">
        <span>{formatCurrency(low, currency)}</span>
        <span>{formatCurrency(high, currency)}</span>
      </div>
    </div>
  );
}
