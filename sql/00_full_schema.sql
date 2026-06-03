-- AI Hub V2 — schéma Postgres minimal (nouveau projet Supabase)
-- Exécuter une fois dans Supabase → SQL Editor sur un projet VIERGE.
-- L'app recrée aussi ces tables au boot si DATABASE_URL est défini (idempotent).

-- ── Duels comparateur (votes communauté A vs B) ─────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_community_votes_created
  ON community_votes (created_at DESC);

-- ── Feed communauté ───────────────────────────────────────────────────────
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
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  voter_id VARCHAR(64) NOT NULL,
  direction VARCHAR(8) NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, voter_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_social_posts_kind ON social_posts (kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments (post_id, created_at);

-- Pas de RLS pour l'instant : seul le backend Next.js (DATABASE_URL) écrit en base.
-- Quand Supabase Auth sera activé, ajouter RLS + colonne user_id.
