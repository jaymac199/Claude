import type { QuoteResult } from '../data';
import { STOCKS } from '../config/stocks';
import { buildTakeaways } from '../lib/takeaways';

interface Props {
  quotes: Record<string, QuoteResult>;
  loading: boolean;
}

export function Takeaways({ quotes, loading }: Props) {
  return (
    <section className="card">
      <h3 className="section-title">Key takeaways</h3>
      <div className="takeaways-grid">
        {STOCKS.map((s) => {
          const q = quotes[s.symbol];
          return (
            <div key={s.symbol} className="takeaways">
              <h4 className="takeaways__heading">
                {s.symbol} <span className="muted">· {s.name}</span>
              </h4>
              {loading || !q ? (
                <ul className="takeaways__list">
                  <li className="skeleton skeleton--line" style={{ width: '90%' }} />
                  <li className="skeleton skeleton--line" style={{ width: '75%' }} />
                  <li className="skeleton skeleton--line" style={{ width: '85%' }} />
                </ul>
              ) : (
                <ul className="takeaways__list">
                  {buildTakeaways(q.quote).map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
