import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesResult } from '../data';
import { STOCKS } from '../config/stocks';
import type { TimeRange } from '../types/market';
import { formatAxisTime, formatDateTime, formatPercent } from '../lib/format';
import { ChartSkeleton, EmptyState } from './StatusStates';
import { TimeRangeSelector } from './TimeRangeSelector';

interface Props {
  series: Record<string, SeriesResult>;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  loading: boolean;
}

const INTRADAY: TimeRange[] = ['1D', '5D'];

type Row = { time: number } & Record<string, number>;

export function ComparisonChart({ series, range, onRangeChange, loading }: Props) {
  const intraday = INTRADAY.includes(range);

  // Rebase each stock to 0% at the start of the range, then merge by timestamp so
  // both lines share one X axis.
  const data = useMemo<Row[]>(() => {
    const byTime = new Map<number, Row>();
    for (const stock of STOCKS) {
      const candles = series[stock.symbol]?.candles ?? [];
      if (candles.length === 0) continue;
      const base = candles[0].close || 1;
      for (const c of candles) {
        const row = byTime.get(c.time) ?? ({ time: c.time } as Row);
        row[stock.symbol] = ((c.close - base) / base) * 100;
        byTime.set(c.time, row);
      }
    }
    return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
  }, [series]);

  const hasData = data.length >= 2;

  return (
    <section className="card chart-card">
      <div className="chart-card__title">
        <h3 className="section-title">
          Performance comparison <span className="muted">(% change, rebased)</span>
        </h3>
        <TimeRangeSelector value={range} onChange={onRangeChange} disabled={loading} />
      </div>

      <div className="chart-area">
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyState message="Not enough data to compare over this range." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="4 4" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => formatAxisTime(t, intraday)}
                stroke="var(--muted)"
                fontSize={12}
                minTickGap={40}
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={12}
                width={60}
                tickFormatter={(v) => formatPercent(v, false)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(t) => formatDateTime(t as number)}
                formatter={(value: number, name: string) => [formatPercent(value), name]}
              />
              <Legend />
              {STOCKS.map((s) => (
                <Line
                  key={s.symbol}
                  type="monotone"
                  dataKey={s.symbol}
                  name={s.symbol}
                  stroke={s.accent}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text)',
};
