/** Consistent custom tooltip used by every chart (sparkline, price, comparison). */

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
}

interface Props {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number | string;
  formatValue: (value: number) => string;
  formatLabel?: (label: number) => string;
  /** Hide the per-series name (used for single-series charts). */
  hideName?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  formatLabel,
  hideName,
}: Props) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip">
      {formatLabel && typeof label === 'number' && (
        <div className="chart-tooltip__label">{formatLabel(label)}</div>
      )}
      {payload.map((entry) => (
        <div className="chart-tooltip__row" key={String(entry.dataKey)}>
          {!hideName && (
            <>
              <span
                className="chart-tooltip__dot"
                style={{ background: entry.color ?? 'var(--accent)' }}
                aria-hidden="true"
              />
              <span className="chart-tooltip__name">{entry.name}</span>
            </>
          )}
          <span className="chart-tooltip__value">{formatValue(entry.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}
