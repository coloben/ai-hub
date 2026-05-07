-- ============================================================
-- Migration complète : recrée TOUTES les tables manquantes
-- Après suppression du projet Supabase
-- ============================================================

-- 1. Table profiles (étend le auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username      text UNIQUE,
  display_name  text,
  avatar_url    text,
  bio           text,
  karma         int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_owner_write" ON public.profiles;
CREATE POLICY "profiles_owner_write" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger : créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Table comments (commentaires sur les news)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     text NOT NULL,
  user_id     uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  parent_id   uuid REFERENCES public.comments ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) > 0),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_owner_all" ON public.comments;
CREATE POLICY "comments_owner_all"   ON public.comments FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);


-- 3. Table votes (upvote/downvote sur les news)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id   text NOT NULL,
  target_type text NOT NULL DEFAULT 'news',
  user_id     uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  value       int NOT NULL CHECK (value IN (1, -1)),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (target_id, user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "votes_public_read" ON public.votes;
CREATE POLICY "votes_public_read" ON public.votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "votes_owner_all" ON public.votes;
CREATE POLICY "votes_owner_all"   ON public.votes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_id);


-- 4. Table user_alerts (alertes personnalisées)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  model_id          text NOT NULL,
  condition         text NOT NULL CHECK (condition IN ('elo_above','elo_below','new_release','price_drop')),
  threshold         numeric,
  is_active         bool DEFAULT true,
  last_triggered_at timestamptz,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (user_id, model_id, condition)
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_alerts_owner" ON public.user_alerts;
CREATE POLICY "user_alerts_owner" ON public.user_alerts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON public.user_alerts(user_id, is_active);


-- 5. Table arena_scores (scores LMSYS Chatbot Arena)
-- ============================================================
DROP TABLE IF EXISTS public.arena_scores CASCADE;
CREATE TABLE public.arena_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      text NOT NULL,
  model_name    text NOT NULL,
  arena_score   numeric NOT NULL,
  confidence_lower numeric,
  confidence_upper numeric,
  rank          int,
  organization  text,
  license       text,
  samples       int,
  votes         int,
  scraped_at    timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.arena_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arena_scores_public_read" ON public.arena_scores;
CREATE POLICY "arena_scores_public_read" ON public.arena_scores FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_arena_scores_model ON public.arena_scores(model_id);
CREATE INDEX IF NOT EXISTS idx_arena_scores_scraped ON public.arena_scores(scraped_at DESC);

-- Fix : ajoute les colonnes si la table arena_scores préexiste avec un ancien schéma
ALTER TABLE public.arena_scores
  ADD COLUMN IF NOT EXISTS model_id text,
  ADD COLUMN IF NOT EXISTS model_name text,
  ADD COLUMN IF NOT EXISTS arena_score numeric,
  ADD COLUMN IF NOT EXISTS confidence_lower numeric,
  ADD COLUMN IF NOT EXISTS confidence_upper numeric,
  ADD COLUMN IF NOT EXISTS rank int,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS license text,
  ADD COLUMN IF NOT EXISTS samples int,
  ADD COLUMN IF NOT EXISTS votes int,
  ADD COLUMN IF NOT EXISTS scraped_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Vue pour le leaderboard actuel (dernier scrape par modèle)
CREATE OR REPLACE VIEW public.arena_scores_latest AS
SELECT DISTINCT ON (model_id) *
FROM public.arena_scores
ORDER BY model_id, scraped_at DESC;


-- 6. Table news_cache (cache des news pour le feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_cache (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  summary     text,
  source      text,
  category    text,
  url         text,
  tags        text[],
  is_breaking bool DEFAULT false,
  hype_score  int DEFAULT 0,
  published_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "news_cache_public_read" ON public.news_cache;
CREATE POLICY "news_cache_public_read" ON public.news_cache FOR SELECT USING (true);
