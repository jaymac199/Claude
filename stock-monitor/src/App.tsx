import { useEffect } from 'react';
import { STOCKS } from './config/stocks';
import { activeProviderId } from './data';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useMarketData } from './hooks/useMarketData';
import { formatDateTime } from './lib/format';
import { ComparisonChart } from './components/ComparisonChart';
import { Header } from './components/Header';
import { Notes } from './components/Notes';
import { PriceChart } from './components/PriceChart';
import { StatsTable } from './components/StatsTable';
import { StockCard } from './components/StockCard';
import { Takeaways } from './components/Takeaways';
import { DataBanner } from './components/StatusStates';

type Theme = 'light' | 'dark';

export default function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('pref:theme', 'dark');
  const market = useMarketData();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <Header
        status={market.status}
        lastUpdated={market.lastUpdated}
        refreshing={market.refreshing}
        autoRefresh={market.autoRefresh}
        onToggleAutoRefresh={market.setAutoRefresh}
        onRefresh={market.refresh}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        hasLiveProvider={market.hasLiveProvider}
      />

      <main className="app__main">
        {market.errorMessage && (
          <DataBanner message={market.errorMessage} tone="warn" onRetry={market.refresh} />
        )}
        {!market.hasLiveProvider && (
          <DataBanner
            tone="info"
            message="No API key set — showing demo data. Add VITE_MARKET_DATA_API_KEY in a .env file for live prices."
          />
        )}

        <section className="grid grid--cards" aria-label="Stock summaries">
          {STOCKS.map((s) => (
            <StockCard
              key={s.symbol}
              stock={s}
              quote={market.quotes[s.symbol]}
              series={market.series[s.symbol]}
              loading={market.loading}
            />
          ))}
        </section>

        <Takeaways quotes={market.quotes} loading={market.loading} />

        <PriceChart
          series={market.series}
          range={market.range}
          onRangeChange={market.setRange}
          loading={market.loading || market.seriesLoading}
        />

        <ComparisonChart
          series={market.series}
          range={market.range}
          onRangeChange={market.setRange}
          loading={market.loading || market.seriesLoading}
        />

        <StatsTable quotes={market.quotes} loading={market.loading} />

        <Notes />
      </main>

      <footer className="app-footer">
        <span>
          Data source: <strong>{activeProviderId === 'twelvedata' ? 'Twelve Data' : 'Demo data'}</strong>
        </span>
        <span>
          {market.lastUpdated
            ? `Last refreshed: ${formatDateTime(market.lastUpdated)}`
            : 'Awaiting first refresh…'}
        </span>
      </footer>
    </div>
  );
}
