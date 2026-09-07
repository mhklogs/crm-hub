import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";

/**
 * Local-first SQLite store using Node's built-in driver (zero native deps).
 * Swap for Supabase/Postgres in production by replacing the function bodies
 * in this file — the rest of the app only imports these helpers.
 */

export const DB_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const DB_PATH = path.join(DB_DIR, "crm.db");

let db: DatabaseSync | null = null;

function getDb() {
  if (db) return db;
  mkdirSync(DB_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  migrate(db);
  return db;
}

function migrate(d: DatabaseSync) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      ms_oid TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      ms_email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      contact_id INTEGER REFERENCES contacts(id),
      title TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'lead',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      contact_id INTEGER REFERENCES contacts(id),
      kind TEXT NOT NULL,            -- team_message | call | sms | video | note
      direction TEXT NOT NULL,       -- inbound | outbound
      summary TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
  `);
}

export type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, ...params: SQLInputValue[]): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params) as T[];
}

export function get<T = Row>(sql: string, ...params: SQLInputValue[]): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params) as T | undefined;
}

export function run(sql: string, ...params: SQLInputValue[]): { lastInsertRowid: number; changes: number } {
  const stmt = getDb().prepare(sql);
  const res = stmt.run(...params);
  return { lastInsertRowid: Number(res.lastInsertRowid), changes: Number(res.changes) };
}