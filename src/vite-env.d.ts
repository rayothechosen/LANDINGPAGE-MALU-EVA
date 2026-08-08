/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LP_VARIANT: "eva" | "malu";
  readonly VITE_UTMIFY_PIXEL_ID: string;
  readonly VITE_SITE_TITLE: string;
  readonly VITE_SITE_DESCRIPTION: string;
  readonly VITE_THEME_COLOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
