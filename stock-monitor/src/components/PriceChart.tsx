import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesResult } from '../data';
import { STOCKS, getStock } from '../config/stocks';
import type { TimeRange } from '../types/market';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  direction,
  formatAxisTime,
  formatCurrency,
  formatDateTime,
  formatPercent,
} from '../lib/format';
import { ChartSkeleton, EmptyState } from './StatusStates';
import { TimeRangeSelector } from './TimeRangeSelector';

type ChartMode = 'price' | 'percent';

interface Props {
  series: Record<string, SeriesResult>;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  loading: boolean;
}

const INTRADAY: TimeRange[] = ['1D', '5D'];

export function PriceChart({ series, range, onRangeChange, loading }: Props) {
  const [symbol, setSymbol] = useLocalStorage<string>('pref:chartSymbol', STOCKS[0].symbol);
  const [mode, setMode] = useLocalStorage<ChartMode>('pref:chartMode', 'price');

  const stock = getStock(symbol) ?? STOCKS[0];
  const candles = series[symbol]?.candles ?? [];
  const intraday = INTRADAY.includes(range);

  const data = useMemo(() => {
    if (candles.length === 0) return [];
    const base = candles[0].close || 1;
    return candles.map((c) => ({
      time: c.time,
      price: c.close,
      percent: ((c.close - base) / base) * 100,
    }));
  }, [candles]);

  const lastValue = data.length ? (mode === 'price' ? data[data.length - 1].price : data[data.length - 1].percent) : 0;
  const firstValue = data.length ? (mode === 'price' ? data[0].price : 0) : 0;
  const trendDir = direction(lastValue - firstValue);
  const lineColor =
    trendDir === 'up' ? 'var(--up)' : trendDir === 'down' ? 'var(--down)' : 'var(--muted)';

  return (
    <section className="card chart-card">
      <div className="chart-card__controls">
        <div className="ticker-select" role="group" aria-label="Select stock">
          {STOCKS.map((s) => (
            <button
              key={s.symbol}
              type="button"
              className={`ticker-select__item ${symbol === s.symbol ? 'is-active' : ''}`}
              aria-pressed={symbol === s.symbol}
              onClick={() => setSymbol(s.symbol)}
            >
              {s.symbol}
            </button>
          ))}
        </div>

        <div className="chart-card__toggle">
          <button
            type="button"
            className={`toggle-btn ${mode === 'price' ? 'is-active' : ''}`}
            aria-pressed={mode === 'price'}
            onClick={() => setMode('price')}
          >
            Price
          </button>
          <button
            type="button"
            className={`toggle-btn ${mode === 'percent' ? 'is-active' : ''}`}
            aria-pressed={mode === 'percent'}
            onClick={() => setMode('percent')}
          >
            % Change
          </button>
        </div>
      </div>

      <div className="chart-card__title">
        <h3 className="section-title">
          {stock.name} <span className="muted">({stock.symbol})</span>
        </h3>
        <TimeRangeSelector value={range} onChange={onRangeChange} disabled={loading} />
      </div>

      <div className="chart-area">
        {loading ? (
          <ChartSkeleton />
        ) : data.length < 2 ? (
          <EmptyState message="No chart data available for this range." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => formatAxisTime(t, intraday)}
                stroke="var(--muted)"
                fontSize={12}
                minTickGap={40}
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={12}
                width={60}
                domain={['auto', 'auto']}
                tickFormatter={(v) =>
                  mode === 'price' ? formatCurrency(v, stock.currency) : formatPercent(v, false)
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(t) => formatDateTime(t as number)}
                formatter={(value: number) => [
                  mode === 'price' ? formatCurrency(value, stock.currency) : formatPercent(value),
                  mode === 'price' ? 'Price' : 'Change',
                ]}
              />
              <Line
                type="monotone"
                dataKey={mode}
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
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
