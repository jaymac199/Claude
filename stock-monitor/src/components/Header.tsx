import type { DataStatus } from '../types/market';
import { formatRelative } from '../lib/format';

type Theme = 'light' | 'dark';

interface Props {
  status: DataStatus;
  lastUpdated: number | null;
  refreshing: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: (on: boolean) => void;
  onRefresh: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  hasLiveProvider: boolean;
}

const STATUS_META: Record<DataStatus, { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'status--live' },
  delayed: { label: 'Delayed', cls: 'status--delayed' },
  mock: { label: 'Demo data', cls: 'status--mock' },
  error: { label: 'Error', cls: 'status--error' },
};

export function Header({
  status,
  lastUpdated,
  refreshing,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  theme,
  onToggleTheme,
  hasLiveProvider,
}: Props) {
  const meta = STATUS_META[hasLiveProvider ? status : 'mock'];

  return (
    <header className="app-header">
      <div className="app-header__title">
        <h1>
          Stock Monitor: <span className="accent">MELI</span> &amp;{' '}
          <span className="accent">SMCI</span>
        </h1>
        <div className="app-header__meta">
          <span className={`status-badge ${meta.cls}`}>
            <span className="status-badge__dot" aria-hidden="true" />
            {meta.label}
          </span>
          <span className="app-header__updated">
            {lastUpdated ? `Updated ${formatRelative(lastUpdated)}` : 'Loading…'}
          </span>
        </div>
      </div>

      <div className="app-header__controls">
        <label className="switch" title="Auto-refresh every 60 seconds">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onToggleAutoRefresh(e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span className="switch__label">Auto-refresh</span>
        </label>

        <button type="button" className="btn btn--primary" onClick={onRefresh} disabled={refreshing}>
          <span className={`btn__icon ${refreshing ? 'is-spinning' : ''}`} aria-hidden="true">
            ↻
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>

        <button
          type="button"
          className="btn btn--icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}
