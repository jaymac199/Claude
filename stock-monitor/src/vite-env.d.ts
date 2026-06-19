/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MARKET_DATA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
