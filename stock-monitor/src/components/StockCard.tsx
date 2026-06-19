import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { QuoteResult, SeriesResult } from '../data';
import type { StockConfig } from '../types/market';
import {
  direction,
  formatCurrency,
  formatRelative,
  formatSignedCurrency,
  formatPercent,
} from '../lib/format';
import { ChartTooltip } from './ChartTooltip';
import { MovementBadge } from './MovementBadge';
import { RangeBar } from './RangeBar';
import { CardSkeleton } from './StatusStates';

interface Props {
  stock: StockConfig;
  quote?: QuoteResult;
  series?: SeriesResult;
  loading: boolean;
}

export function StockCard({ stock, quote, series, loading }: Props) {
  if (loading || !quote) {
    return <CardSkeleton />;
  }

  const q = quote.quote;
  const dir = direction(q.change);
  const sparkData = (series?.candles ?? []).map((c) => ({ time: c.time, value: c.close }));
  const color = dir === 'up' ? 'var(--up)' : dir === 'down' ? 'var(--down)' : 'var(--muted)';
  const gradientId = `spark-${stock.symbol}`;

  return (
    <article className={`card stock-card stock-card--${dir}`} aria-label={`${stock.name} summary`}>
      <header className="stock-card__head">
        <div>
          <h2 className="stock-card__symbol">{stock.symbol}</h2>
          <p className="stock-card__name">{stock.name}</p>
        </div>
        <span className={`pill ${q.isMarketOpen ? 'pill--open' : 'pill--closed'}`}>
          <span className="pill__dot" aria-hidden="true" />
          {q.isMarketOpen ? 'Market open' : 'Market closed'}
        </span>
      </header>

      <div className="stock-card__price-row">
        <span className="stock-card__price">{formatCurrency(q.price, q.currency)}</span>
        <MovementBadge
          value={q.change}
          size="lg"
          text={`${formatSignedCurrency(q.change, q.currency)} (${formatPercent(q.changePercent)})`}
        />
      </div>

      <div className="stock-card__spark">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height={68}>
            <AreaChart data={sparkData} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                content={
                  <ChartTooltip
                    hideName
                    formatValue={(v) => formatCurrency(v, q.currency)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="stock-card__spark-empty">No chart data</div>
        )}
      </div>

      <RangeBar
        label="Day range"
        low={q.dayLow}
        high={q.dayHigh}
        value={q.price}
        currency={q.currency}
      />

      <footer className="stock-card__foot">Updated {formatRelative(q.timestamp)}</footer>
    </article>
  );
}
