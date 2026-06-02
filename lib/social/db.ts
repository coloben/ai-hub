import { getPool as baseGetPool, hasDatabase } from '@/lib/db'

export { hasDatabase }

export function getPool() {
  return baseGetPool()
}

const INIT_SQL = `
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

export async function ensureSocialSchema(): Promise<void> {
  if (!hasDatabase()) return
  if (!schemaReady) {
    schemaReady = getPool()
      .query(INIT_SQL)
      .then(() => undefined)
  }
  await schemaReady
}
