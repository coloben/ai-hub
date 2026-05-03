-- ============================================================
-- AI Hub Community — Migration 001
-- Run this in Supabase SQL Editor
-- ============================================================

-- Profiles (étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  avatar_url    text, 
  karma         int NOT NULL DEFAULT 0,
  level         text NOT NULL DEFAULT 'observateur',
  interests     text[] DEFAULT '{}',
  followed_models text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  last_seen_at  timestamptz DEFAULT now(),
  is_banned     bool DEFAULT false
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_write"  ON public.profiles FOR ALL USING (auth.uid() = id);

-- Posts (news soumises par la communauté)
CREATE TABLE IF NOT EXISTS public.posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid REFERENCES public.profiles ON DELETE SET NULL,
  title       text NOT NULL,
  url         text,
  summary     text,
  category    text DEFAULT 'community',
  tags        text[] DEFAULT '{}',
  score       int DEFAULT 0,
  is_verified bool DEFAULT false,
  is_removed  bool DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read"   ON public.posts FOR SELECT USING (NOT is_removed);
CREATE POLICY "posts_auth_insert"   ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_owner_delete"  ON public.posts FOR UPDATE USING (auth.uid() = author_id);

-- Votes
CREATE TABLE IF NOT EXISTS public.votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  target_id   uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post','comment','benchmark')),
  value       smallint NOT NULL CHECK (value IN (1,-1)),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, target_id, target_type)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_auth_all" ON public.votes FOR ALL USING (auth.uid() = user_id);

-- Comments (threaded)
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  author_id   uuid REFERENCES public.profiles ON DELETE SET NULL,
  parent_id   uuid REFERENCES public.comments ON DELETE CASCADE,
  content     text NOT NULL,
  score       int DEFAULT 0,
  is_removed  bool DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  edited_at   timestamptz
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read"  ON public.comments FOR SELECT USING (NOT is_removed);
CREATE POLICY "comments_auth_insert"  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_owner_update" ON public.comments FOR UPDATE USING (auth.uid() = author_id);

-- Model reviews
CREATE TABLE IF NOT EXISTS public.model_reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  model_id        text NOT NULL,
  rating_quality  smallint CHECK (rating_quality BETWEEN 1 AND 5),
  rating_speed    smallint CHECK (rating_speed BETWEEN 1 AND 5),
  rating_value    smallint CHECK (rating_value BETWEEN 1 AND 5),
  review_text     text,
  use_case        text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, model_id)
);

ALTER TABLE public.model_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.model_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_write"  ON public.model_reviews FOR ALL USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  target_id   text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('model','post','news')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, target_id, target_type)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_owner_all" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- User alerts
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  model_id            text NOT NULL,
  condition           text NOT NULL CHECK (condition IN ('elo_above','elo_below','new_release','price_drop')),
  threshold           numeric,
  is_active           bool DEFAULT true,
  last_triggered_at   timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_owner_all" ON public.user_alerts FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type        text NOT NULL,
  payload     jsonb DEFAULT '{}',
  is_read     bool DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifs_owner_all" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles ON DELETE SET NULL,
  target_id   uuid NOT NULL,
  target_type text NOT NULL,
  reason      text NOT NULL,
  status      text DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_auth_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ── Fonctions ───────────────────────────────────────────────

-- Auto-update score sur vote
CREATE OR REPLACE FUNCTION public.update_score_on_vote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.target_type = 'post' THEN
    UPDATE public.posts SET score = score + NEW.value WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    UPDATE public.comments SET score = score + NEW.value WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_insert
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_score_on_vote();

-- Auto-create profile après signup OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update karma sur vote reçu
CREATE OR REPLACE FUNCTION public.update_karma_on_vote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_author_id uuid;
BEGIN
  IF NEW.target_type = 'post' THEN
    SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    SELECT author_id INTO v_author_id FROM public.comments WHERE id = NEW.target_id;
  END IF;

  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    UPDATE public.profiles
    SET karma = karma + (NEW.value * CASE WHEN NEW.target_type = 'post' THEN 5 ELSE 3 END),
        level = CASE
          WHEN karma + (NEW.value * 3) >= 1000 THEN 'architecte'
          WHEN karma + (NEW.value * 3) >= 500  THEN 'expert'
          WHEN karma + (NEW.value * 3) >= 200  THEN 'analyste'
          WHEN karma + (NEW.value * 3) >= 50   THEN 'contributeur'
          ELSE 'observateur'
        END
    WHERE id = v_author_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_karma
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_karma_on_vote();

-- Fonction helper karma
CREATE OR REPLACE FUNCTION public.increment_karma(user_id uuid, amount int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET karma = karma + amount WHERE id = user_id;
END;
$$;

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_posts_created     ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_score       ON public.posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post     ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_votes_target      ON public.votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_notifs_user       ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user    ON public.bookmarks(user_id, target_type);

-- ============================================================
-- Storage — bucket avatars (photos de profil)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Upload uniquement vers son propre dossier  avatars/{user_id}.*
CREATE POLICY "avatars_owner_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Mise à jour / remplacement
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Suppression
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Table user_alerts (alertes personnalisées)
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
CREATE POLICY "user_alerts_owner" ON public.user_alerts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON public.user_alerts(user_id, is_active);
