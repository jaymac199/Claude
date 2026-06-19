/** Reusable loading / error / empty states. */

export function CardSkeleton() {
  return (
    <div className="card skeleton-card" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton--line" style={{ width: '40%' }} />
      <div className="skeleton skeleton--title" style={{ width: '60%' }} />
      <div className="skeleton skeleton--line" style={{ width: '30%' }} />
      <div className="skeleton skeleton--block" />
    </div>
  );
}

export function ChartSkeleton({ label = 'Loading chart…' }: { label?: string }) {
  return (
    <div className="chart-skeleton" aria-busy="true" aria-label={label}>
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <strong>⚠ Something went wrong</strong>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="state state--empty">
      <p>{message}</p>
    </div>
  );
}

/** Dismissible-style banner shown when live data is unavailable. */
export function DataBanner({ message }: { message: string }) {
  return (
    <div className="banner banner--warn" role="status">
      <span aria-hidden="true">ⓘ</span>
      <span>{message}</span>
    </div>
  );
}
