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
import { MovementBadge } from './MovementBadge';
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
          <ResponsiveContainer width="100%" height={64}>
            <AreaChart data={sparkData} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={() => ''}
                formatter={(value: number) => [formatCurrency(value, q.currency), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="value"
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

      <footer className="stock-card__foot">
        Updated {formatRelative(q.timestamp)}
      </footer>
    </article>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text)',
};
