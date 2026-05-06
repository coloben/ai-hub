-- Table pour stocker les scores Arena scrapés
-- Permet historique + rollback en cas de données aberrantes

CREATE TABLE IF NOT EXISTS arena_scores (
  id SERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  elo INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  num_battles INTEGER DEFAULT 0,
  speed_tps INTEGER,
  source TEXT NOT NULL DEFAULT 'arena_live',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_validated BOOLEAN NOT NULL DEFAULT FALSE,
  validation_notes TEXT,
  delta_from_previous INTEGER,
  previous_elo INTEGER
);

CREATE INDEX IF NOT EXISTS idx_arena_scores_model_id ON arena_scores(model_id);
CREATE INDEX IF NOT EXISTS idx_arena_scores_fetched_at ON arena_scores(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_arena_scores_validated ON arena_scores(is_validated, fetched_at DESC);

-- Vue : derniers scores validés par modèle
CREATE OR REPLACE VIEW latest_arena_scores AS
SELECT DISTINCT ON (model_id) *
FROM arena_scores
WHERE is_validated = TRUE
ORDER BY model_id, fetched_at DESC;

-- Fonction : récupère les scores précédents pour validation
CREATE OR REPLACE FUNCTION get_previous_scores()
RETURNS TABLE(model_id TEXT, elo INTEGER, fetched_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (a.model_id) a.model_id, a.elo, a.fetched_at
  FROM arena_scores a
  WHERE a.is_validated = TRUE
  ORDER BY a.model_id, a.fetched_at DESC;
END;
$$ LANGUAGE plpgsql;
