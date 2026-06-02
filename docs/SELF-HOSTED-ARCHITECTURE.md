# AI Hub — Architecture Auto-Hébergée sur VPS

> **Mission** : Déployer AI Hub sur un VPS personnel avec PostgreSQL local, zéro dépendance SaaS.

---

## 1. Pourquoi l'Auto-Hébergement ?

| SaaS | Problème | Solution auto-hébergée |
|---|---|---|
| **Vercel** | Payant au-delà du hobby tier, vendor lock-in | Docker + Nginx sur VPS |
| **Supabase** | Gratuit limité à 500MB, vendor lock-in | PostgreSQL local + pgBouncer |
| **Clerk/Auth0** | Coûte cher à l'échelle | Auth interne avec bcrypt + JWT |
| **Stripe** | Commission 2.9% + 0.30€ | Pas de paiement sur AI Hub (gratuit) |

**Résultat** : Tu contrôles tout. Pas de facture surprise. Pas de "service discontinué". Ton VPS, tes règles.

---

## 2. Stack Auto-Hébergée Recommandée

```
┌──────────────────────────────────────────────────────────────┐
│                     VPS (Ubuntu 22.04 LTS)                    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Nginx   │  │ Next.js  │  │ PostgreSQL│  │  Redis   │    │
│  │  (reverse│  │  (app)   │  │  (DB)    │  │  (cache) │    │
│  │   proxy) │  │          │  │          │  │          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │            │            │           │
│       └─────────────┴────────────┴────────────┘           │
│                          Docker Compose                    │
│                                                               │
│  SSL: Let's Encrypt (Certbot)                                 │
│  Monitoring: Prometheus + Grafana                             │
│  Backups: pg_dump + rclone vers S3                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Docker Compose — Fichier Complet

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ── Next.js App ──────────────────────────────────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ai-hub-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://aihub:${DB_PASSWORD}@postgres:5432/aihub
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://ai-hub-ton-domaine.com
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - ai-hub

  # ── PostgreSQL ─────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: ai-hub-postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_USER=aihub
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=aihub
    ports:
      - "5432:5432"
    networks:
      - ai-hub

  # ── Redis (cache + sessions) ───────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: ai-hub-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - ai-hub

  # ── Nginx (reverse proxy + SSL) ───────────────────────────
  nginx:
    image: nginx:alpine
    container_name: ai-hub-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - certbot_data:/etc/letsencrypt
    depends_on:
      - app
    networks:
      - ai-hub

  # ── Certbot (SSL auto) ────────────────────────────────────
  certbot:
    image: certbot/certbot
    container_name: ai-hub-certbot
    volumes:
      - certbot_data:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h; done'"
    networks:
      - ai-hub

volumes:
  postgres_data:
  redis_data:
  certbot_data:

networks:
  ai-hub:
    driver: bridge
```

---

## 4. Schéma PostgreSQL Complet

```sql
-- init.sql
-- AI Hub Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    password_hash VARCHAR(255), -- nullable for OAuth-only users
    email_verified BOOLEAN DEFAULT FALSE,
    reputation INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reputation ON users(reputation DESC);

-- ── OAuth Accounts ───────────────────────────────────────────
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', 'discord'
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_user ON oauth_accounts(user_id);

-- ── Sessions ─────────────────────────────────────────────────
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ── Benchmarks (A vs B duels) ────────────────────────────────
CREATE TABLE benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_a VARCHAR(100) NOT NULL,
    model_b VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'global', 'coding', 'creativity', 'reasoning', 'french', 'multimodal'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- when the duel ends
    UNIQUE(model_a, model_b, category)
);

-- ── Votes ────────────────────────────────────────────────────
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    benchmark_id UUID NOT NULL REFERENCES benchmarks(id) ON DELETE CASCADE,
    choice VARCHAR(1) NOT NULL CHECK (choice IN ('A', 'B')), -- which model they voted for
    fingerprint VARCHAR(64), -- for anonymous voting tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, benchmark_id)
);

CREATE INDEX idx_votes_benchmark ON votes(benchmark_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_fingerprint ON votes(fingerprint);

-- ── Leaderboard Cache ───────────────────────────────────────
CREATE TABLE leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model VARCHAR(100) NOT NULL,
    organization VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    elo INTEGER NOT NULL DEFAULT 1200,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    win_rate NUMERIC(5,2) DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model, category)
);

CREATE INDEX idx_leaderboard_category ON leaderboard_cache(category, elo DESC);

-- ── Badges ───────────────────────────────────────────────────
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    requirement_type VARCHAR(50), -- 'votes_count', 'streak', 'reputation'
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── User Badges ──────────────────────────────────────────────
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- ── Posts (community) ────────────────────────────────────────
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    votes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- ── Insert default badges ──────────────────────────────────
INSERT INTO badges (slug, name, description, icon, color, requirement_type, requirement_value) VALUES
('early-adopter', 'Pionnier', 'Compte créé avant les 10 000 premiers utilisateurs', '🚀', '#00d4aa', NULL, NULL),
('benchmarker', 'Benchmarker', 'A voté 100 fois sur les duels', '⚖️', '#3b82f6', 'votes_count', 100),
('streak-7', 'Consistent', '7 jours de suite sur AI Hub', '🔥', '#f59e0b', 'streak', 7),
('top-contributor', 'Top 5%', 'Dans le top 5% des contributeurs', '⭐', '#fbbf24', 'reputation', 1000),
('paper-hunter', 'Paper Hunter', 'A partagé 10 papers de recherche', '📄', '#10b981', NULL, 10);

-- ── Function: update leaderboard after vote ──────────────────
CREATE OR REPLACE FUNCTION update_leaderboard_after_vote()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate ELO for the benchmark pair
    -- This is a simplified version; the real one would use Glicko-2 or TrueSkill
    UPDATE leaderboard_cache
    SET 
        wins = CASE 
            WHEN model = (SELECT model_a FROM benchmarks WHERE id = NEW.benchmark_id) AND NEW.choice = 'A' THEN wins + 1
            WHEN model = (SELECT model_b FROM benchmarks WHERE id = NEW.benchmark_id) AND NEW.choice = 'B' THEN wins + 1
            ELSE wins
        END,
        losses = CASE 
            WHEN model = (SELECT model_a FROM benchmarks WHERE id = NEW.benchmark_id) AND NEW.choice = 'B' THEN losses + 1
            WHEN model = (SELECT model_b FROM benchmarks WHERE id = NEW.benchmark_id) AND NEW.choice = 'A' THEN losses + 1
            ELSE losses
        END,
        total_votes = total_votes + 1,
        updated_at = NOW()
    WHERE model IN (
        SELECT model_a FROM benchmarks WHERE id = NEW.benchmark_id
        UNION
        SELECT model_b FROM benchmarks WHERE id = NEW.benchmark_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leaderboard
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_after_vote();
```

---

## 5. Déploiement sur VPS — Script Complet

```bash
#!/bin/bash
# deploy.sh

set -e

DOMAIN="ai-hub-ton-domaine.com"
EMAIL="ton-email@example.com"

echo "🚀 Déploiement AI Hub sur VPS..."

# 1. Install Docker & Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx

# 2. Clone repo
git clone https://github.com/ton-repo/ai-hub.git /opt/ai-hub
cd /opt/ai-hub

# 3. Create .env
cat > .env << EOF
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://${DOMAIN}
GITHUB_CLIENT_ID=votre-id
GITHUB_CLIENT_SECRET=votre-secret
EOF

# 4. Build & start
docker compose up -d --build

# 5. SSL
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --agree-tos -m ${EMAIL} -n

# 6. Nginx config
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Déployé sur https://${DOMAIN}"
echo "📊 DB: localhost:5432"
echo "🔑 Admin: docker exec -it ai-hub-postgres psql -U aihub -d aihub"
```

---

## 6. Next.js — Connexion à PostgreSQL Local

```typescript
// lib/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
}

// Usage:
// const { rows } = await db.query('SELECT * FROM users WHERE username = $1', ['john'])
```

---

## 7. Architecture Complète

```
VPS (Ubuntu 22.04)
├── Docker Compose
│   ├── app (Next.js 15 + Node 20)
│   ├── postgres (PostgreSQL 16)
│   ├── redis (Redis 7)
│   ├── nginx (reverse proxy + SSL)
│   └── certbot (Let's Encrypt auto)
│
├── /opt/ai-hub/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env
│   └── init.sql
│
├── Backups (cron daily)
│   ├── pg_dump → /backups/
│   └── rclone → S3 (optional)
│
└── Monitoring
    ├── Prometheus (metrics)
    └── Grafana (dashboards)
```

---

## 8. Checklist Déploiement

- [ ] VPS loué (Hetzner, OVH, DigitalOcean ~5-10€/mois)
- [ ] DNS pointe vers le VPS
- [ ] Docker + Docker Compose installés
- [ ] `init.sql` exécuté (schema créé)
- [ ] `.env` configuré avec vraies valeurs
- [ ] GitHub OAuth app créée (Client ID + Secret)
- [ ] `docker compose up -d` OK
- [ ] SSL Let's Encrypt fonctionne
- [ ] Health check : `curl https://ton-domaine.com/api/health`
- [ ] Backup automatique configuré
- [ ] Monitoring (Prometheus + Grafana) optionnel

---

> **Coût mensuel estimé** : 5-10€ (VPS) + 0€ (logiciels open source) = **independance totale**.
