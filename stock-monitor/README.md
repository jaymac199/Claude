# Stock Monitor: MELI & SMCI

A lightweight, responsive dashboard for keeping an eye on **Mercado Libre (MELI)**
and **Super Micro Computer (SMCI)** — current price, today's movement, interactive
charts, a side-by-side performance comparison, key fundamentals, plain-English
takeaways, and personal notes saved in your browser.

It runs out of the box on built-in **demo data**, and switches to **live data** as
soon as you add an API key.

---

## Quick start

```bash
cd stock-monitor
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). With no API key it runs on
demo data — every feature works, charts and all.

### Build for production

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build locally
```

---

## Live market data (API key)

The app uses **[Twelve Data](https://twelvedata.com/)** for live quotes and charts.

1. Create a free account and copy your API key.
2. Add it via an environment variable:

   ```bash
   cp .env.example .env
   # then edit .env:
   VITE_MARKET_DATA_API_KEY=your_key_here
   ```

3. Restart `npm run dev`. The status badge in the header changes from **Demo data**
   to **Live** / **Delayed**.

> Vite only exposes env vars prefixed with `VITE_` to the browser. The key ships in
> the client bundle (unavoidable for a pure front-end app) — use a free/throwaway
> key, and put it behind a backend proxy if you ever deploy this publicly.

### Rate limits & how they're handled

Twelve Data's **free tier** allows **800 requests/day** and **8 requests/min**.
The app stays well within this by:

- **Caching** every response in `localStorage` (quotes ~30s, charts ~5min), so
  re-renders and quick range switches don't spend requests.
- **Auto-refresh pulls only quotes** (the cheap calls) every 60s; the heavier
  time-series is refetched only when you change the range or hit **Refresh**.
- **Graceful fallback**: if a live call is rate-limited or fails, the affected
  panel falls back to demo data and a banner explains why — the dashboard never
  goes blank.

> **Market cap** comes from Twelve Data's `/statistics` endpoint, which may be
> restricted on the free tier. When unavailable it simply shows `—`.

---

## Adding another stock

Add one line to [`src/config/stocks.ts`](src/config/stocks.ts):

```ts
export const STOCKS: StockConfig[] = [
  { symbol: 'MELI', name: 'Mercado Libre', currency: 'USD', seed: 1850, accent: '#ffe600' },
  { symbol: 'SMCI', name: 'Super Micro Computer', currency: 'USD', seed: 42, accent: '#22d3ee' },
  { symbol: 'AAPL', name: 'Apple', currency: 'USD', seed: 210, accent: '#a78bfa' }, // ← new
];
```

Cards, charts, the comparison, the stats table, takeaways, and notes all derive
from this array — no other changes needed. (`seed`/`accent` only affect demo data
and the comparison line color.)

---

## Architecture

```
src/
  config/stocks.ts      Tracked stocks (single source of truth)
  types/market.ts       Shared types + MarketDataProvider interface
  data/
    twelveData.ts       Live adapter (Twelve Data REST API)
    mockProvider.ts     Deterministic demo/fallback data
    index.ts            Provider selection + caching + graceful fallback
  hooks/
    useMarketData.ts    Loads quotes/series, manual + 60s auto refresh
    useLocalStorage.ts  Persisted state (notes, theme, prefs)
  lib/
    format.ts           Currency/percent/volume/time formatters + movement helpers
    takeaways.ts        Plain-English daily summary (pure function)
  components/           Presentational UI (cards, charts, table, notes, states…)
  App.tsx               Layout + wiring
```

**Data flow.** `useMarketData` asks the `data/` layer for each symbol's quote and
time-series. `data/index.ts` picks the live provider when `VITE_MARKET_DATA_API_KEY`
is set (otherwise the mock provider), wraps calls in a `localStorage` cache, and
falls back to mock data on failure. Swapping data sources is just implementing the
`MarketDataProvider` interface — the UI never talks to an API directly.

**State & persistence.** React hooks only (no global store). `localStorage` holds
notes, the theme, selected ticker/range, the chart mode, and the auto-refresh
toggle, so your setup survives refreshes.

**Charts.** [Recharts](https://recharts.org/) — line charts with hover tooltips,
an absolute-price ↔ %-change toggle on the per-stock chart, and a rebased (0% at
range start) MELI-vs-SMCI comparison chart.

### Tech stack

React 18 · TypeScript · Vite · Recharts · plain CSS with design tokens (light/dark).

---

## Features checklist

- Two large summary cards with sparklines, market-status pills, and movement badges
- Current price, daily change & % change, day high/low, open, previous close,
  volume, market cap, 52-week high/low, and update time
- Interactive per-stock chart with ticker selector, range selector, and price/%
  toggle
- MELI-vs-SMCI percentage comparison chart
- Time ranges: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y
- Positive/negative styling using color **plus** arrows, +/− signs, and labels
- Plain-English "Key takeaways" per stock
- Locally-saved "Watchlist notes" per stock
- Loading skeletons, error states, and a clear "data unavailable" banner
- Manual refresh, 60s auto-refresh toggle, and dark/light theme toggle
```
