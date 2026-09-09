import 'server-only';
import postgres from 'postgres';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Lead } from './types';

const globalDb = globalThis as unknown as { localDb?: DatabaseSync; pgDb?: ReturnType<typeof postgres> };
export const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;
export async function query<T = Record<string, unknown>>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  if (databaseUrl()) {
    globalDb.pgDb ??= postgres(databaseUrl()!, { max: 3, idle_timeout: 20, connect_timeout: 10, prepare: false });
    const rows = await globalDb.pgDb.unsafe(sql, params);
    return Array.from(rows) as T[];
  }
  if (process.env.VERCEL || process.env.LOCAL_DATABASE !== 'true') throw new Error('DATABASE_NOT_CONFIGURED');
  if (!globalDb.localDb) {
    const folder = join(process.cwd(), 'data'); mkdirSync(folder, { recursive: true });
    globalDb.localDb = new DatabaseSync(join(folder, 'portal.sqlite'));
    globalDb.localDb.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    globalDb.localDb.exec(readFileSync(join(process.cwd(), 'db/schema.sql'), 'utf8'));
  }
  const values: (string | number)[] = [];
  const sqliteSql = sql.replace(/\$(\d+)/g, (_, index) => { values.push(params[Number(index)-1]); return '?'; });
  return globalDb.localDb.prepare(sqliteSql).all(...values) as T[];
}
export async function listLeads(): Promise<Lead[]> {
  const rows = await query<{data:string}>('SELECT data FROM leads');
  return rows.map(r=>JSON.parse(r.data) as Lead).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export async function getLead(id: string): Promise<Lead | null> {
  const [row] = await query<{data:string}>('SELECT data FROM leads WHERE id = $1', [id]);
  return row ? JSON.parse(row.data) : null;
}
export async function insertLead(lead: Lead) {
  const rows = await query('INSERT INTO leads (id, data, version) VALUES ($1, $2, 1) ON CONFLICT (id) DO NOTHING RETURNING id', [lead.id, JSON.stringify(lead)]);
  return rows.length > 0;
}
export async function mutateLead(id: string, mutate: (lead: Lead) => Lead) {
  for(let attempt=0;attempt<8;attempt++) {
    const [row] = await query<{data:string; version:number}>('SELECT data, version FROM leads WHERE id = $1', [id]);
    if (!row) return null;
    const lead = mutate(JSON.parse(row.data)); lead.updatedAt = new Date().toISOString();
    const changed = await query('UPDATE leads SET data = $1, version = version + 1 WHERE id = $2 AND version = $3 RETURNING id', [JSON.stringify(lead), id, row.version]);
    if(changed.length) return lead;
  }
  throw new Error('CONCURRENT_UPDATE');
}
export async function consumeLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const [row] = await query<{hits:number}>('INSERT INTO rate_limits (key,hits,expires) VALUES ($1,1,$2) ON CONFLICT (key) DO UPDATE SET hits = CASE WHEN rate_limits.expires < $3 THEN 1 ELSE rate_limits.hits + 1 END, expires = CASE WHEN rate_limits.expires < $3 THEN $2 ELSE rate_limits.expires END RETURNING hits', [key, now+windowMs, now]);
  return row.hits <= max;
}
