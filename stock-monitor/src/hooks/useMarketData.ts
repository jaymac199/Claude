import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLS } from '../config/stocks';
import {
  fetchQuote,
  fetchSeries,
  hasLiveProvider,
  type QuoteResult,
  type SeriesResult,
} from '../data';
import type { DataStatus, TimeRange } from '../types/market';
import { useLocalStorage } from './useLocalStorage';

const AUTO_REFRESH_MS = 60_000;

type QuoteMap = Record<string, QuoteResult>;
type SeriesMap = Record<string, SeriesResult>;

/**
 * Central data hook: loads quotes + the current range's time-series for every
 * configured symbol, manages manual + auto refresh, and exposes an aggregate
 * status/error for the whole dashboard.
 *
 * Cost control: auto-refresh only re-pulls (cheap) quotes; the heavier
 * time-series is only refetched on range change or a manual refresh.
 */
export function useMarketData() {
  const [range, setRange] = useLocalStorage<TimeRange>('pref:range', '1M');
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>('pref:autoRefresh', true);

  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [series, setSeries] = useState<SeriesMap>({});
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadQuotes = useCallback(async (force: boolean) => {
    const results = await Promise.all(SYMBOLS.map((s) => fetchQuote(s, force)));
    setQuotes(Object.fromEntries(SYMBOLS.map((s, i) => [s, results[i]])));
    setLastUpdated(Date.now());
  }, []);

  const loadSeries = useCallback(async (r: TimeRange, force: boolean) => {
    const results = await Promise.all(SYMBOLS.map((s) => fetchSeries(s, r, force)));
    setSeries(Object.fromEntries(SYMBOLS.map((s, i) => [s, results[i]])));
  }, []);

  // Initial full load.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadQuotes(false), loadSeries(range, false)]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload series when the range changes (the very first run is handled above).
  const firstRangeRun = useRef(true);
  useEffect(() => {
    if (firstRangeRun.current) {
      firstRangeRun.current = false;
      return;
    }
    let cancelled = false;
    setSeriesLoading(true);
    loadSeries(range, false).finally(() => {
      if (!cancelled) setSeriesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [range, loadSeries]);

  // Auto-refresh quotes on an interval.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      void loadQuotes(true);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, loadQuotes]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadQuotes(true), loadSeries(range, true)]);
    } finally {
      setRefreshing(false);
    }
  }, [loadQuotes, loadSeries, range]);

  const { status, errorMessage } = useMemo(() => {
    const all = [...Object.values(quotes), ...Object.values(series)];
    const error = all.find((r) => r.error)?.error ?? null;
    let agg: DataStatus = 'live';
    if (all.length === 0) agg = 'live';
    else if (all.some((r) => r.status === 'mock')) agg = 'mock';
    else if (all.some((r) => r.status === 'delayed')) agg = 'delayed';
    return { status: agg, errorMessage: error };
  }, [quotes, series]);

  return {
    quotes,
    series,
    range,
    setRange,
    autoRefresh,
    setAutoRefresh,
    loading,
    seriesLoading,
    refreshing,
    lastUpdated,
    status,
    errorMessage,
    refresh,
    hasLiveProvider,
    autoRefreshIntervalMs: AUTO_REFRESH_MS,
  };
}

export type MarketData = ReturnType<typeof useMarketData>;
