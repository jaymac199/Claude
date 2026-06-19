import type { ReactNode } from 'react';

/** Reusable loading / empty / error states with a consistent visual language. */

export function CardSkeleton() {
  return (
    <div className="card skeleton-card" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton--line" style={{ width: '35%' }} />
      <div className="skeleton skeleton--title" style={{ width: '62%' }} />
      <div className="skeleton skeleton--line" style={{ width: '28%' }} />
      <div className="skeleton skeleton--block" />
      <div className="skeleton skeleton--line" style={{ width: '45%' }} />
    </div>
  );
}

export function ChartSkeleton({ label = 'Loading chart…' }: { label?: string }) {
  return (
    <div className="chart-state" aria-busy="true" aria-label={label}>
      <div className="spinner" />
      <span className="chart-state__title">{label}</span>
    </div>
  );
}

interface StateMessageProps {
  variant: 'empty' | 'error';
  icon?: ReactNode;
  title: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Single primitive for non-loading chart/section states. */
export function StateMessage({
  variant,
  icon,
  title,
  body,
  onRetry,
  retryLabel = 'Try again',
}: StateMessageProps) {
  const role = variant === 'error' ? 'alert' : undefined;
  return (
    <div className={`chart-state chart-state--${variant}`} role={role}>
      <span className={`chart-state__icon chart-state__icon--${variant}`} aria-hidden="true">
        {icon ?? (variant === 'error' ? '!' : '∅')}
      </span>
      <span className="chart-state__title">{title}</span>
      {body && <span className="chart-state__body">{body}</span>}
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          <span aria-hidden="true">↻</span> {retryLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, title = 'No data to show' }: { message: string; title?: string }) {
  return <StateMessage variant="empty" title={title} body={message} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <StateMessage variant="error" title="Something went wrong" body={message} onRetry={onRetry} />;
}

interface BannerProps {
  message: string;
  tone?: 'info' | 'warn';
  onRetry?: () => void;
}

/** Inline banner shown above the dashboard when data is degraded or in demo mode. */
export function DataBanner({ message, tone = 'warn', onRetry }: BannerProps) {
  return (
    <div className={`banner banner--${tone}`} role="status">
      <span className="banner__icon" aria-hidden="true">
        {tone === 'warn' ? '!' : 'i'}
      </span>
      <span className="banner__text">{message}</span>
      {onRetry && (
        <button type="button" className="banner__action" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
