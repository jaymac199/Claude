import type { QuoteResult } from '../data';
import { STOCKS } from '../config/stocks';
import {
  formatCompact,
  formatCurrency,
  formatDateTime,
  formatMarketCap,
} from '../lib/format';

interface Props {
  quotes: Record<string, QuoteResult>;
  loading: boolean;
}

interface Row {
  label: string;
  render: (q: QuoteResult) => string;
}

const ROWS: Row[] = [
  { label: 'Open', render: (q) => formatCurrency(q.quote.open, q.quote.currency) },
  { label: 'Previous close', render: (q) => formatCurrency(q.quote.previousClose, q.quote.currency) },
  { label: 'Day high', render: (q) => formatCurrency(q.quote.dayHigh, q.quote.currency) },
  { label: 'Day low', render: (q) => formatCurrency(q.quote.dayLow, q.quote.currency) },
  { label: 'Volume', render: (q) => formatCompact(q.quote.volume) },
  { label: 'Market cap', render: (q) => formatMarketCap(q.quote.marketCap) },
  {
    label: '52-week high',
    render: (q) =>
      q.quote.fiftyTwoWeekHigh != null
        ? formatCurrency(q.quote.fiftyTwoWeekHigh, q.quote.currency)
        : '—',
  },
  {
    label: '52-week low',
    render: (q) =>
      q.quote.fiftyTwoWeekLow != null
        ? formatCurrency(q.quote.fiftyTwoWeekLow, q.quote.currency)
        : '—',
  },
  { label: 'Last update', render: (q) => formatDateTime(q.quote.timestamp) },
];

export function StatsTable({ quotes, loading }: Props) {
  return (
    <div className="card">
      <h3 className="section-title">Key statistics</h3>
      <div className="table-scroll">
        <table className="stats-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {STOCKS.map((s) => (
                <th key={s.symbol} scope="col">
                  {s.symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {STOCKS.map((s) => {
                  const q = quotes[s.symbol];
                  return (
                    <td key={s.symbol}>
                      {loading || !q ? <span className="skeleton skeleton--cell" /> : row.render(q)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
