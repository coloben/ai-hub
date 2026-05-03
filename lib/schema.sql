-- AI Intelligence Hub — Schema SQL
-- Compatible Postgres 15+ / Supabase / Neon
-- Run once to initialize the database

CREATE TABLE IF NOT EXISTS news_items (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  summary       TEXT,
  source        TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('research', 'release', 'benchmark', 'industry', 'pricing', 'security', 'community')),
  published_at  TIMESTAMPTZ NOT NULL,
  url           TEXT NOT NULL,
  tags          JSONB DEFAULT '[]',
  is_breaking   BOOLEAN DEFAULT false,
  hype_score    SMALLINT DEFAULT 50,
  ingested_at   TIMESTAMPTZ DEFAULT NOW(),
  -- Enrichment fields
  sentiment     TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  entities      JSONB DEFAULT '[]',
  confidence_score SMALLINT,
  connector_id  TEXT,
  verification_status TEXT CHECK (verification_status IN ('confirmed', 'watch', 'unverified', 'contradicted'))
);

CREATE INDEX IF NOT EXISTS news_items_published_idx ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS news_items_source_idx    ON news_items (source);
CREATE INDEX IF NOT EXISTS news_items_category_idx  ON news_items (category);

CREATE TABLE IF NOT EXISTS model_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  model_id      TEXT NOT NULL,
  model_name    TEXT NOT NULL,
  provider      TEXT NOT NULL,
  captured_at   TIMESTAMPTZ DEFAULT NOW(),
  arena_elo     INTEGER,
  price_input   NUMERIC(10,4),
  price_output  NUMERIC(10,4),
  rank          SMALLINT
);

CREATE INDEX IF NOT EXISTS snapshots_model_id_idx    ON model_snapshots (model_id);
CREATE INDEX IF NOT EXISTS snapshots_captured_at_idx ON model_snapshots (captured_at DESC);

CREATE TABLE IF NOT EXISTS verification_events (
  id                  BIGSERIAL PRIMARY KEY,
  news_item_id        TEXT REFERENCES news_items(id) ON DELETE CASCADE,
  status              TEXT NOT NULL CHECK (status IN ('confirmed', 'watch', 'unverified', 'contradicted')),
  consensus_score     SMALLINT,
  confirming_sources  JSONB DEFAULT '[]',
  contradiction_sources JSONB DEFAULT '[]',
  badge               TEXT,
  rationale           TEXT,
  verified_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_watchlists (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  rule_id     TEXT NOT NULL,
  rule_type   TEXT NOT NULL,
  enabled     BOOLEAN DEFAULT true,
  threshold   NUMERIC,
  targets     JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, rule_id)
);

CREATE TABLE IF NOT EXISTS alert_events (
  id            BIGSERIAL PRIMARY KEY,
  type          TEXT NOT NULL,
  priority      TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title         TEXT NOT NULL,
  description   TEXT,
  action        TEXT,
  related_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  seen_by       JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS alert_events_type_idx     ON alert_events (type);
CREATE INDEX IF NOT EXISTS alert_events_priority_idx ON alert_events (priority);
CREATE INDEX IF NOT EXISTS alert_events_created_idx  ON alert_events (created_at DESC);

CREATE TABLE IF NOT EXISTS sources (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('rss', 'api', 'manual')),
  reliability  TEXT NOT NULL CHECK (reliability IN ('official', 'independent', 'community', 'vendor')),
  category     TEXT NOT NULL,
  enabled      BOOLEAN DEFAULT true,
  requires_key BOOLEAN DEFAULT false,
  last_fetched TIMESTAMPTZ,
  fetch_errors SMALLINT DEFAULT 0,
  priority     TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  description  TEXT
);

-- Source health monitoring
CREATE TABLE IF NOT EXISTS source_health (
  id                BIGSERIAL PRIMARY KEY,
  source_id         TEXT REFERENCES sources(id) ON DELETE CASCADE,
  last_success_at   TIMESTAMPTZ,
  last_error        TEXT,
  consecutive_failures SMALLINT DEFAULT 0,
  success_rate_24h  SMALLINT DEFAULT 100,
  avg_response_ms   INTEGER DEFAULT 0,
  is_healthy        BOOLEAN DEFAULT true,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS source_health_source_idx ON source_health (source_id);

-- Scheduler metrics
CREATE TABLE IF NOT EXISTS scheduler_metrics (
  id                    BIGSERIAL PRIMARY KEY,
  run_at                TIMESTAMPTZ DEFAULT NOW(),
  mode                  TEXT CHECK (mode IN ('fast', 'full', 'daily')),
  items_ingested        INTEGER DEFAULT 0,
  sources_processed     INTEGER DEFAULT 0,
  sources_healthy       INTEGER DEFAULT 0,
  sources_unhealthy     INTEGER DEFAULT 0,
  errors                JSONB DEFAULT '[]',
  duration_ms           INTEGER,
  circuit_breakers_open INTEGER DEFAULT 0
);
