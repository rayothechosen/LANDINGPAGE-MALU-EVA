import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ModuleConfig {
  enabled:          boolean;
  disabled_message: string;
}

export interface GlobalNoticeConfig {
  enabled: boolean;
  message: string;
  type:    "info" | "warning" | "danger" | "success";
}

export interface SystemSettings {
  limits: {
    ai_routines_daily:           number;
    group_plans_weekly:          number;
    product_videos_weekly:       number;
    product_videos_trial_total:  number;
  };
  expiration: {
    ai_routines_days:    number;
    product_videos_days: number;
  };
  modules: {
    ai_videos:     ModuleConfig;
    product_video: ModuleConfig;
    hot_products:  ModuleConfig;
    video_maker:   ModuleConfig;
    groups:        ModuleConfig;
    pack_videos:   ModuleConfig;
    carousels:     ModuleConfig;
    stories:       ModuleConfig;
  };
  system: {
    global_notice: GlobalNoticeConfig;
  };
}

// ── Fallbacks padrão ──────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: SystemSettings = {
  limits: {
    ai_routines_daily:           3,
    group_plans_weekly:          3,
    product_videos_weekly:       1,
    product_videos_trial_total:  1,
  },
  expiration: {
    ai_routines_days:    3,
    product_videos_days: 2,
  },
  modules: {
    ai_videos:     { enabled: true, disabled_message: "IA de Videos esta temporariamente indisponivel." },
    product_video: { enabled: true, disabled_message: "Produto em Video esta temporariamente indisponivel." },
    hot_products:  { enabled: true, disabled_message: "Produtos em Alta esta temporariamente indisponivel." },
    video_maker:   { enabled: true, disabled_message: "Gerador Videos Proprios esta temporariamente indisponivel." },
    groups:        { enabled: true, disabled_message: "Grupos Lucrativos esta temporariamente indisponivel." },
    pack_videos:   { enabled: true, disabled_message: "Pack de Videos esta temporariamente indisponivel." },
    carousels:     { enabled: true, disabled_message: "Carrosseis Prontos esta temporariamente indisponivel." },
    stories:       { enabled: true, disabled_message: "Stories Prontos esta temporariamente indisponivel." },
  },
  system: {
    global_notice: { enabled: false, message: "", type: "info" },
  },
};

// ── Cache de sessão ───────────────────────────────────────────────────────────

let _cache:   SystemSettings | null = null;
let _cacheTs: number                = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// ── Conversores ───────────────────────────────────────────────────────────────

function toNum(v: unknown, fallback: number): number {
  if (typeof v === "number")  return isNaN(v) ? fallback : v;
  if (typeof v === "string")  { const n = parseInt(v, 10); return isNaN(n) ? fallback : n; }
  return fallback;
}

function toBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string")  return v === "true";
  return fallback;
}

function toStr(v: unknown, fallback: string): string {
  if (typeof v === "string") return v;
  return fallback;
}

// ── Builder ───────────────────────────────────────────────────────────────────

function buildSettings(rows: Array<{ key: string; value: unknown }>): SystemSettings {
  // Deep-clone dos defaults
  const s: SystemSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  for (const { key, value: v } of rows) {
    const parts = key.split(".");
    if (parts.length < 2) continue;

    if (parts[0] === "limits" && parts[1]) {
      const k = parts[1] as keyof SystemSettings["limits"];
      if (k in s.limits) s.limits[k] = toNum(v, s.limits[k]);
    }

    if (parts[0] === "expiration" && parts[1]) {
      const k = parts[1] as keyof SystemSettings["expiration"];
      if (k in s.expiration) s.expiration[k] = toNum(v, s.expiration[k]);
    }

    if (parts[0] === "modules" && parts[1] && parts[2]) {
      const mod  = parts[1] as keyof SystemSettings["modules"];
      const prop = parts[2];
      if (mod in s.modules) {
        if (prop === "enabled")
          s.modules[mod].enabled = toBool(v, s.modules[mod].enabled);
        if (prop === "disabled_message")
          s.modules[mod].disabled_message = toStr(v, s.modules[mod].disabled_message);
      }
    }

    if (parts[0] === "system" && parts[1] === "global_notice" && parts[2]) {
      const prop = parts[2];
      if (prop === "enabled") s.system.global_notice.enabled = toBool(v, false);
      if (prop === "message") s.system.global_notice.message = toStr(v, "");
      if (prop === "type")
        s.system.global_notice.type =
          toStr(v, "info") as GlobalNoticeConfig["type"];
    }
  }

  return s;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(
    _cache ?? DEFAULT_SETTINGS
  );
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState<string | null>(null);

  const load = async (force = false) => {
    if (!force && _cache && Date.now() - _cacheTs < CACHE_TTL_MS) {
      setSettings(_cache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from("system_settings")
      .select("key, value");

    if (fetchErr || !data) {
      console.warn("[useSystemSettings] erro:", fetchErr?.message);
      // Em caso de erro, usa defaults (nao bloqueia o app)
      setError(fetchErr?.message ?? "Erro ao carregar configuracoes");
      setSettings(DEFAULT_SETTINGS);
    } else {
      const built = buildSettings(
        data as Array<{ key: string; value: unknown }>
      );
      _cache   = built;
      _cacheTs = Date.now();
      setSettings(built);
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    settings,
    loading,
    error,
    refetch: () => load(true),
  };
}

// ── Helper getSetting ─────────────────────────────────────────────────────────

export function getSetting<T>(
  settings: SystemSettings,
  keyPath:  string,
  fallback: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = settings;
  for (const p of keyPath.split(".")) {
    if (cur == null || typeof cur !== "object") return fallback;
    cur = cur[p];
  }
  return (cur ?? fallback) as T;
}

// ── Invalida cache (para forçar refetch em outros componentes) ────────────────

export function invalidateSettingsCache() {
  _cache   = null;
  _cacheTs = 0;
}
