import { Pool, type PoolConfig } from 'pg'

let pool: Pool | null = null

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function poolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL!
  const isServerless = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
  return {
    connectionString,
    max: isServerless ? 1 : 5,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: connectionString.includes('supabase')
      ? { rejectUnauthorized: false }
      : undefined,
  }
}

export function getPool(): Pool {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL is not configured')
  }
  if (!pool) {
    pool = new Pool(poolConfig())
    pool.on('error', (err) => {
      console.error('[DB] idle pool error', err)
    })
  }
  return pool
}

/** Reset pool after fatal connection errors (serverless cold starts) */
export async function resetPool(): Promise<void> {
  if (pool) {
    try {
      await pool.end()
    } catch {
      /* ignore */
    }
    pool = null
  }
}

const VOTE_SCHEMA_SQL = `
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

const SOCIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  kind VARCHAR(16) NOT NULL DEFAULT 'community',
  hub VARCHAR(32) NOT NULL,
  flair VARCHAR(32) NOT NULL,
  author VARCHAR(64) NOT NULL,
  handle VARCHAR(32) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  upvotes INT NOT NULL DEFAULT 1,
  downvotes INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 1,
  comment_count INT NOT NULL DEFAULT 0,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS social_post_votes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  voter_id VARCHAR(64) NOT NULL,
  direction VARCHAR(8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, voter_id)
);
CREATE TABLE IF NOT EXISTS social_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  parent_id TEXT,
  author VARCHAR(64) NOT NULL,
  handle VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  upvotes INT NOT NULL DEFAULT 1,
  downvotes INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_posts_hub ON social_posts (hub, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments (post_id, created_at);
`

let schemaReady: Promise<void> | null = null

export async function ensureAllSchemas(): Promise<void> {
  if (!hasDatabase()) return
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool()
      await p.query(VOTE_SCHEMA_SQL)
      await p.query(SOCIAL_SCHEMA_SQL)
    })()
  }
  await schemaReady
}

export async function ensureVoteSchema(): Promise<void> {
  return ensureAllSchemas()
}

/** Retry once after pool reset (serverless stale connections) */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === 'ECONNRESET' || code === '57P01' || code === '53300') {
      await resetPool()
      return await fn()
    }
    throw err
  }
}
