/**
 * @file supabase.ts
 * @description Zero-dependency Supabase client (PostgREST over fetch).
 *
 * Why not @supabase/supabase-js? This keeps the bundle tiny and works in any
 * environment — the official SDK is a thin wrapper over the same REST calls.
 *
 * Configuration sources (first match wins):
 *  1. Values saved by the owner in Admin Panel → Company Settings → Cloud Database
 *     (persisted under localStorage key `milkpop_supabase_config`)
 *  2. Vite env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 *
 * When neither is present every call is a no-op and the app runs on
 * localStorage alone — nothing breaks without a backend.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const CONFIG_KEY = 'milkpop_supabase_config';

export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const cfg = JSON.parse(stored);
      if (cfg?.url && cfg?.anonKey) return cfg;
    }
  } catch { /* fall through to env */ }
  const env = (import.meta as any).env || {};
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    return { url: env.VITE_SUPABASE_URL, anonKey: env.VITE_SUPABASE_ANON_KEY };
  }
  return null;
}

export function saveSupabaseConfig(cfg: SupabaseConfig | null) {
  try {
    if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CONFIG_KEY);
  } catch (e) { console.warn('Unable to persist Supabase config', e); }
}

export const isCloudConfigured = () => !!getSupabaseConfig();

function headers(cfg: SupabaseConfig, extra: Record<string, string> = {}) {
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function rest<T>(path: string, init: RequestInit & { headers?: Record<string, string> } = {}): Promise<T> {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error('Supabase is not configured');
  const url = `${cfg.url.replace(/\/$/, '')}/rest/v1/${path}`;
  const res = await fetch(url, { ...init, headers: headers(cfg, init.headers) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** SELECT * (optionally with a PostgREST query string, e.g. `order=placed_at.desc&limit=100`). */
export function sbSelect<T = any>(table: string, query = 'select=*'): Promise<T[]> {
  return rest<T[]>(`${table}?${query}`);
}

/** Bulk UPSERT on primary key. Returns nothing (Prefer: return=minimal keeps payloads small). */
export function sbUpsert(table: string, rows: any[], onConflict = 'id'): Promise<void> {
  if (!rows.length) return Promise.resolve();

  // Ensure every row has the exact same keys
  const allKeys = Array.from(
    new Set(rows.flatMap(row => Object.keys(row)))
  );

  const normalizedRows = rows.map(row => {
    const normalized: Record<string, any> = {};
    for (const key of allKeys) {
      normalized[key] = key in row ? row[key] : null;
    }
    return normalized;
  });

  return rest<void>(`${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(normalizedRows),
  });
}

/** DELETE rows whose primary key is in `ids`. */
export function sbDeleteByIds(table: string, ids: string[], pk = 'id'): Promise<void> {
  if (!ids.length) return Promise.resolve();
  const list = ids.map((i) => `"${String(i).replace(/"/g, '')}"`).join(',');
  return rest<void>(`${table}?${pk}=in.(${encodeURIComponent(list)})`, { method: 'DELETE' });
}

/** Call a Postgres function exposed through PostgREST RPC. */
export function sbRpc<T = any>(fn: string, args: Record<string, any>): Promise<T> {
  return rest<T>(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });
}

/** Lightweight connectivity + schema check. Returns an error string or null when healthy. */
export async function sbHealthCheck(): Promise<string | null> {
  try {
    await rest('site_settings?select=id&limit=1');
    return null;
  } catch (e: any) {
    return e?.message || 'Unknown connection error';
  }
}

/* ------------------------------------------------------------------ */
/*  camelCase ⇄ snake_case row conversion.                             */
/*  The Supabase schema (supabase/schema.sql) mirrors the app types    */
/*  field-for-field, so a mechanical conversion is all that's needed.  */
/* ------------------------------------------------------------------ */
const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const snakeToCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

export function toRow(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[camelToSnake(k)] = v;
  }
  return out;
}

export function fromRow<T = any>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) out[snakeToCamel(k)] = v === null ? undefined : v;
  return out as T;
}
