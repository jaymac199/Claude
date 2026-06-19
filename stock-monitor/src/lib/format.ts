/** Formatting + movement helpers shared across the UI. */

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 2)}%`;
}

export function formatSignedCurrency(value: number, currency = 'USD'): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}

/** Compact volume, e.g. 12.3M, 4.5B. */
export function formatCompact(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(
    value,
  );
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null) return '—';
  return `$${formatCompact(value)}`;
}

/** Absolute timestamp, e.g. "Jun 19, 2026, 3:45:12 PM". */
export function formatDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Relative time, e.g. "just now", "45s ago", "3m ago". */
export function formatRelative(epochMs: number, now = Date.now()): string {
  const diff = Math.max(0, now - epochMs);
  const sec = Math.round(diff / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return formatDateTime(epochMs);
}

export type Direction = 'up' | 'down' | 'flat';

export function direction(value: number): Direction {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

/** Arrow that does not rely on color alone. */
export function directionArrow(dir: Direction): string {
  return dir === 'up' ? '▲' : dir === 'down' ? '▼' : '▬';
}

export function directionLabel(dir: Direction): string {
  return dir === 'up' ? 'Up' : dir === 'down' ? 'Down' : 'Flat';
}

/** Format a chart tick timestamp depending on the range granularity. */
export function formatAxisTime(epochMs: number, intraday: boolean): string {
  const d = new Date(epochMs);
  if (intraday) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
