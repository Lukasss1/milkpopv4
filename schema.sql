/**
 * @file cloudSync.ts
 * @description Two-way sync between the app's local registries and Supabase.
 *
 * Every localStorage key the app persists has a matching table in
 * supabase/schema.sql. Columns are the snake_case mirror of the app types,
 * with nested arrays/objects stored as JSONB — so the mapping below is
 * mechanical (toRow/fromRow) plus a few per-table field exceptions.
 *
 * Flow:
 *  - `pullAllFromCloud()` on connect → hydrates local state from the database.
 *  - `schedulePush(key, items)` after every local save → debounced upsert +
 *    deletion diff, so the database always mirrors what the owner sees.
 *  - Orders are additionally exploded server-side into order_items /
 *    order_item_modifiers by a trigger (see schema.sql) so analytics stay
 *    fully relational while the client stays simple.
 */
import { isCloudConfigured, sbSelect, sbUpsert, sbDeleteByIds, toRow, fromRow } from './supabase';

export interface SyncMapping {
  storageKey: string;
  table: string;
  /** Fields that live only on the client and must not be sent (none by default). */
  omit?: string[];
  /** Single-row tables (site_settings) upsert with a fixed id. */
  singleton?: boolean;
  /** Primary key column when it isn't `id` (e.g. role_permissions keys on `role`). */
  pk?: string;
  /** Override specific camelCase field -> db column mappings for reserved-word columns. */
  fieldMap?: Record<string, string>;
}

/** The complete registry ⇄ table map. Order matters only for readability. */
export const SYNC_MAP: SyncMapping[] = [
  { storageKey: 'milkpop_site_settings', table: 'site_settings', singleton: true },
  { storageKey: 'milkpop_menu_items', table: 'menu_items' },
  { storageKey: 'milkpop_deals', table: 'deals' },
  { storageKey: 'milkpop_stores_list', table: 'stores' },
  { storageKey: 'milkpop_orders', table: 'orders' },
  { storageKey: 'milkpop_employees', table: 'staff_profiles' },
  { storageKey: 'milkpop_shifts', table: 'work_shifts' },
  { storageKey: 'milkpop_checklist_templates', table: 'checklist_templates' },
  { storageKey: 'milkpop_docs', table: 'staff_documents' },
  { storageKey: 'milkpop_sifr', table: 'sifr_reports' },
  { storageKey: 'milkpop_courses', table: 'training_courses' },
  { storageKey: 'milkpop_assessments', table: 'training_assessments' },
  { storageKey: 'milkpop_articles_list', table: 'kb_articles' },
  { storageKey: 'milkpop_vacancies_list', table: 'job_vacancies' },
  { storageKey: 'milkpop_apps', table: 'job_applications', fieldMap: { position: 'applied_for', store: 'applied_store', positionField: 'applied_for' } },
  { storageKey: 'milkpop_fran', table: 'franchise_inquiries' },
  { storageKey: 'milkpop_contacts', table: 'contact_messages' },
  { storageKey: 'milkpop_news_posts', table: 'news_posts' },
  { storageKey: 'milkpop_cms_pages', table: 'cms_pages' },
  { storageKey: 'milkpop_media_library', table: 'media_assets' },
  { storageKey: 'milkpop_audit_logs', table: 'audit_logs' },
  { storageKey: 'milkpop_permissions_config', table: 'role_permissions', pk: 'role' },
  { storageKey: 'milkpop_clock_history', table: 'clock_history' },
  { storageKey: 'milkpop_payslips', table: 'payslips' },
];

const byKey = new Map(SYNC_MAP.map((m) => [m.storageKey, m]));

/** Every remaining localStorage key syncs through the app_state KV table —
 *  nothing on the website is device-only (except the login session). */
export const KV_KEYS = [
  'milkpop_checklist_tasks',
  'milkpop_checklist_audits',
  'milkpop_shift_covers',
  'milkpop_email_settings',
];
export const KV_PREFIXES = ['milkpop_clock_status_'];
const isKvKey = (key: string) => KV_KEYS.includes(key) || KV_PREFIXES.some((p) => key.startsWith(p));

export type CloudListener = (status: { syncing: boolean; lastSyncAt?: string; lastError?: string }) => void;
let listener: CloudListener | null = null;
export const onCloudStatus = (fn: CloudListener) => { listener = fn; };
const emit = (s: { syncing: boolean; lastSyncAt?: string; lastError?: string }) => listener?.(s);

/* ------------------------------------------------------------------ */
/*  PULL: hydrate local registries from the database                   */
/* ------------------------------------------------------------------ */
/** Reverse a fieldMap when reading rows back from the database. */
function applyFieldMapReverse(obj: any, fieldMap?: Record<string, string>): any {
  if (!fieldMap || !obj) return obj;
  const reversed = Object.fromEntries(Object.entries(fieldMap).map(([app, db]) => [db, app]));
  const result = { ...obj };
  for (const [dbCol, appField] of Object.entries(reversed)) {
    if (dbCol in result) {
      result[appField] = result[dbCol];
      delete result[dbCol];
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  BOOT-RACE GUARD                                                    */
/*  On page load every registry's useEffect fires and schedules a push */
/*  of the LOCAL copy. If those pushes ran before the initial cloud    */
/*  pull finished, a stale/seeded device could overwrite — and, via    */
/*  the deletion diff, even DELETE — fresher rows in the database      */
/*  (this is why newly added staff could vanish on refresh). Pushes    */
/*  are therefore held until the first pull attempt has completed.    */
/* ------------------------------------------------------------------ */
let initialPullDone = false;
/** Explicit "Push everything" bypasses the guard on purpose. */
export function markPullComplete() { initialPullDone = true; }

export async function pullAllFromCloud(): Promise<Record<string, any>> {
  if (!isCloudConfigured()) return {};
  emit({ syncing: true });
  const result: Record<string, any> = {};
  const errors: string[] = [];
  try {
    const kvRows = await sbSelect<{ key: string; value: any }>('app_state', 'select=key,value');
    result.__kv__ = Object.fromEntries(kvRows.map((r) => [r.key, r.value]));
  } catch (e: any) {
    errors.push(`app_state: ${e?.message || e}`);
  }
  for (const m of SYNC_MAP) {
    try {
      const rows = await sbSelect(m.table);
      if (!rows) continue;
      if (m.singleton) {
        if (rows.length) result[m.storageKey] = stripDbFields(applyFieldMapReverse(fromRow(rows[0]), m.fieldMap));
      } else {
        result[m.storageKey] = rows.map((r) => stripDbFields(applyFieldMapReverse(fromRow(r), m.fieldMap)));
      }
    } catch (e: any) {
      errors.push(`${m.table}: ${e?.message || e}`);
    }
  }
  emit({ syncing: false, lastSyncAt: new Date().toISOString(), lastError: errors.length ? errors.join(' | ') : undefined });
  if (errors.length) console.warn('[cloudSync] pull finished with errors:', errors);
  initialPullDone = true; // pushes may now flow — local state reflects the cloud
  return result;
}

/** Database housekeeping columns the client never stores locally. */
function stripDbFields(obj: any) {
  if (obj && typeof obj === 'object') {
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.rowId;
  }
  return obj;
}

/* ------------------------------------------------------------------ */
/*  PUSH: debounced mirror of local saves                              */
/* ------------------------------------------------------------------ */
const pending = new Map<string, any>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function schedulePush(storageKey: string, value: any, delayMs = 900) {
  if (!isCloudConfigured()) return;
  if (!byKey.has(storageKey) && !isKvKey(storageKey)) return;
  pending.set(storageKey, value);
  const existing = timers.get(storageKey);
  if (existing) clearTimeout(existing);
  timers.set(storageKey, setTimeout(() => flushKey(storageKey), delayMs));
}

async function flushKey(storageKey: string, force = false) {
  if (!isCloudConfigured()) return;
  if (!initialPullDone && !force) {
    // Hold this push until the boot pull has hydrated local state,
    // then try again. Prevents stale-device overwrites/deletions.
    timers.set(storageKey, setTimeout(() => flushKey(storageKey), 1200));
    return;
  }
  const value = pending.get(storageKey);
  pending.delete(storageKey);
  timers.delete(storageKey);
  // KV keys go straight into the app_state table
  if (isKvKey(storageKey)) {
    emit({ syncing: true });
    try {
      await sbUpsert('app_state', [{ key: storageKey, value }], 'key');
      emit({ syncing: false, lastSyncAt: new Date().toISOString() });
    } catch (e: any) {
      emit({ syncing: false, lastError: `app_state: ${e?.message || e}` });
    }
    return;
  }
  const mapping = byKey.get(storageKey);
  if (!mapping) return;
  emit({ syncing: true });
  try {
    if (mapping.singleton) {
      await sbUpsert(mapping.table, [{ id: 1, ...toRow(value) }]);
    } else {
      const pk = mapping.pk || 'id';
      const items: any[] = Array.isArray(value) ? value : [];
      const rows = items.map((i) => {
        const row = toRow(i);
        if (mapping.fieldMap) {
          for (const [appField, dbCol] of Object.entries(mapping.fieldMap)) {
            const snakeKey = appField.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
            if (snakeKey in row && snakeKey !== dbCol) {
              row[dbCol] = row[snakeKey];
              delete row[snakeKey];
            }
          }
        }
        return row;
      });
      await sbUpsert(mapping.table, rows, pk);
      // deletion diff — remove rows that no longer exist locally
      const remote = await sbSelect<Record<string, string>>(mapping.table, `select=${pk}`);
      const localIds = new Set(items.map((i) => String(i[pk] ?? i.id)));
      const toDelete = remote.map((r) => r[pk]).filter((id) => !localIds.has(String(id)));
      await sbDeleteByIds(mapping.table, toDelete, pk);
    }
    emit({ syncing: false, lastSyncAt: new Date().toISOString() });
  } catch (e: any) {
    console.warn(`[cloudSync] push failed for ${mapping.table}:`, e);
    emit({ syncing: false, lastError: `${mapping.table}: ${e?.message || e}` });
  }
}

/** Push every registry immediately — used by the "Sync now" button. */
export async function pushAllToCloud(readLocal: (key: string) => any): Promise<string | null> {
  if (!isCloudConfigured()) return 'Supabase is not configured';
  const errors: string[] = [];
  // KV keys first (including per-employee clock status keys found in storage)
  const kvCandidates = [...KV_KEYS];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && KV_PREFIXES.some((p) => k.startsWith(p))) kvCandidates.push(k);
    }
  } catch { /* SSR safety */ }
  for (const key of kvCandidates) {
    const val = readLocal(key);
    if (val === undefined || val === null) continue;
    pending.set(key, val);
    try { await flushKey(key, true); } catch (e: any) { errors.push(`${key}: ${e?.message || e}`); }
  }
  for (const m of SYNC_MAP) {
    const val = readLocal(m.storageKey);
    if (val === undefined || val === null) continue;
    pending.set(m.storageKey, val);
    try {
      await flushKey(m.storageKey, true);
    } catch (e: any) {
      errors.push(`${m.table}: ${e?.message || e}`);
    }
  }
  initialPullDone = true; // the cloud now mirrors this device — normal pushes may flow
  return errors.length ? errors.join(' | ') : null;
}
