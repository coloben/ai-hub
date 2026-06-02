-- Community duel votes (optional — also auto-created by the app when DATABASE_URL is set)
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
