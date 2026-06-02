import { Pool } from 'pg'

let pool: Pool | null = null

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

export function getPool(): Pool {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL is not configured')
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }
  return pool
}

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS community_votes (
  id TEXT PRIMARY KEY,
  category VARCHAR(32) NOT NULL,
  model_low VARCHAR(128) NOT NULL,
  model_high VARCHAR(128) NOT NULL,
  winner_id VARCHAR(128) NOT NULL,
  voter_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, model_low, model_high, voter_id)
);
CREATE INDEX IF NOT EXISTS idx_community_votes_pair
  ON community_votes (category, model_low, model_high);
`

let schemaReady: Promise<void> | null = null

export async function ensureVoteSchema(): Promise<void> {
  if (!hasDatabase()) return
  if (!schemaReady) {
    schemaReady = getPool()
      .query(INIT_SQL)
      .then(() => undefined)
  }
  await schemaReady
}
