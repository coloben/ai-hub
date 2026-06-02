# Multi-Host — cPanel Personnel Auto-Hébergé

> **Mission** : Créer un panneau de contrôle personnel qui gère plusieurs sites web sur un seul VPS, avec monitoring, backups, et déploiement automatique.

---

## 1. Vision

Tu as un VPS. Tu veux héberger :
- **AI Hub** (le site IA)
- **Un blog personnel**
- **Un projet client**
- **Une landing page**
- **Une app interne**

Tout ça sur la même machine, isolé, monitoré, avec un seul dashboard pour tout contrôler.

**Inspirations** : cPanel (commercial), Plesk (commercial), Coolify (open source), CapRover (open source).

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VPS (Ubuntu 22.04)                             │
│                                                                         │
│  ┌──────────────────┐                                                  │
│  │   Multi-Host       │  ← Dashboard Web (Next.js + PostgreSQL)          │
│  │   Dashboard        │     Gère les sites, les domaines, les backups   │
│  │                    │                                                  │
│  │  • Liste des sites │                                                  │
│  │  • Logs temps réel │                                                  │
│  │  • Stats CPU/RAM   │                                                  │
│  │  • Backups 1-clic  │                                                  │
│  │  • SSL auto        │                                                  │
│  │  • Git auto-deploy │                                                  │
│  └────────┬───────────┘                                                  │
│           │                                                             │
│  ┌────────┴──────────────────────────────────────────────────────────┐   │
│  │                     Docker Network (bridge)                         │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│  │  │  Nginx   │  │  AI Hub  │  │  Blog    │  │  Client  │  ...   │   │
│  │  │ (reverse │  │  Next.js │  │  Next.js │  │  App     │       │   │
│  │  │  proxy)  │  │  + PG    │  │  + PG    │  │          │       │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │   │
│  │  │Prometheus│  │ Grafana  │  │  Redis   │                       │   │
│  │  │(metrics) │  │(dash)    │  │ (cache)  │                       │   │
│  │  └──────────┘  └──────────┘  └──────────┘                       │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Traefik (reverse proxy + SSL auto)                                     │
│  • Route le trafic par domaine                                          │
│  • Génère les certificats Let's Encrypt                                 │
│  • Load balancing                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Technique

| Composant | Technologie | Pourquoi |
|---|---|---|
| **Reverse Proxy** | Traefik | SSL auto, routing par domaine, load balancing |
| **Dashboard** | Next.js 15 + PostgreSQL | Interface web moderne, auth, real-time |
| **Container** | Docker + Docker Compose | Isolation par site, reproductible |
| **Monitoring** | Prometheus + Grafana | CPU, RAM, disque, réseau, requêtes |
| **Backups** | Restic + cron | Backup chiffré vers S3 ou local |
| **Git Deploy** | Webhook + script | `git push` = redeploy automatique |
| **Base de données** | PostgreSQL 16 par site | Isolation des données |

---

## 4. Schéma de la Base de Données Multi-Host

```sql
-- Multi-Host Dashboard Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (admin du VPS) ────────────────────────────────────
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- ── Sites ──────────────────────────────────────────────────
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'error', 'deploying')),
    type VARCHAR(50) NOT NULL, -- 'nextjs', 'static', 'docker', 'nodejs', 'python'
    
    -- Git
    git_repo VARCHAR(255),
    git_branch VARCHAR(100) DEFAULT 'main',
    git_webhook_secret VARCHAR(255),
    
    -- Docker
    compose_file TEXT, -- path to docker-compose.yml
    env_vars JSONB DEFAULT '{}',
    
    -- Resources
    memory_limit VARCHAR(20) DEFAULT '512m',
    cpu_limit VARCHAR(20) DEFAULT '1.0',
    
    -- SSL
    ssl_enabled BOOLEAN DEFAULT TRUE,
    ssl_cert_path TEXT,
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    last_deploy_at TIMESTAMP WITH TIME ZONE,
    last_deploy_status VARCHAR(20),
    last_deploy_log TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_domain ON sites(domain);

-- ── Site Backups ────────────────────────────────────────────
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('full', 'database', 'files')),
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    size_bytes BIGINT,
    path TEXT,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ── Logs ───────────────────────────────────────────────────
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    source VARCHAR(50), -- 'app', 'nginx', 'docker', 'system'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_site ON logs(site_id, created_at DESC);

-- ── Metrics ──────────────────────────────────────────────────
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'cpu', 'memory', 'disk', 'network', 'requests'
    value NUMERIC NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_metrics_site_type ON metrics(site_id, metric_type, recorded_at DESC);

-- ── Deployments ────────────────────────────────────────────
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    commit_hash VARCHAR(40),
    commit_message TEXT,
    branch VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'success', 'failed')),
    build_log TEXT,
    duration_ms INTEGER,
    triggered_by VARCHAR(50), -- 'git', 'manual', 'webhook'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_deployments_site ON deployments(site_id, created_at DESC);
```

---

## 5. Docker Compose — Multi-Host Infrastructure

```yaml
# docker-compose.multi-host.yml
version: '3.8'

services:
  # ── Traefik (reverse proxy + SSL) ─────────────────────────
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@ton-domaine.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - multi-host
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`dashboard.ton-domaine.com`)"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"

  # ── Multi-Host Dashboard ──────────────────────────────────
  dashboard:
    build: ./dashboard
    container_name: multi-host-dashboard
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://multihost:${DB_PASSWORD}@postgres:5432/multihost
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - multi-host
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.ton-domaine.com`)"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.services.dashboard.loadbalancer.server.port=3000"

  # ── Multi-Host PostgreSQL ─────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: multihost-postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=multihost
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=multihost
    networks:
      - multi-host

  # ── Prometheus (metrics) ──────────────────────────────────
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - multi-host
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(`metrics.ton-domaine.com`)"

  # ── Grafana (dashboards) ────────────────────────────────────
  grafana:
    image: grafana/grafana
    container_name: grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - multi-host
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.ton-domaine.com`)"

volumes:
  letsencrypt:
  postgres_data:
  prometheus_data:
  grafana_data:

networks:
  multi-host:
    driver: bridge
```

---

## 6. Dashboard UI — Fonctionnalités

### Page : Liste des Sites
```
┌──────────────────────────────────────────────────────────────┐
│  Multi-Host Dashboard                    [+] Nouveau site   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ AI Hub  │  │  Blog   │  │ Client  │  │  App    │       │
│  │ 🟢 Live │  │ 🟢 Live │  │ 🟢 Live │  │ 🟡 Build│       │
│  │ ai-hub. │  │ blog.   │  │ client. │  │ app.    │       │
│  │ com     │  │ com     │  │ com     │  │ com     │       │
│  │         │  │         │  │         │  │         │       │
│  │ CPU:12% │  │ CPU:5%  │  │ CPU:8%  │  │ CPU:--  │       │
│  │ RAM:45% │  │ RAM:30% │  │ RAM:25% │  │ RAM:--  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page : Détail d'un Site
```
┌──────────────────────────────────────────────────────────────┐
│  ← Retour    AI Hub                    [Redémarrer] [Stop]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  URL: https://ai-hub.ton-domaine.com                         │
│  Type: Next.js 15 | DB: PostgreSQL 16 | Cache: Redis 7      │
│                                                              │
│  [Logs temps réel]  [Metrics]  [Backups]  [Settings]        │
│                                                              │
│  ┌─ Logs ──────────────────────────────────────────────┐   │
│  │ [2024-05-17 14:23:01] [app] GET /ranking 200 45ms   │   │
│  │ [2024-05-17 14:23:02] [app] GET /api/feed 200 23ms  │   │
│  │ [2024-05-17 14:23:05] [nginx] 200 45ms             │   │
│  │ ...                                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Metrics (7 jours) ─────────────────────────────────┐   │
│  │ 📊 CPU: ████████░░ 78% moyenne                      │   │
│  │ 📊 RAM: ██████░░░░ 62% moyenne                      │   │
│  │ 📊 Req: ██████████ 12.4k requêtes/jour              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Deploy ────────────────────────────────────────────┐   │
│  │ Git: https://github.com/ton-repo/ai-hub.git          │   │
│  │ Branch: main                                         │   │
│  │ Dernier deploy: il y a 2 heures (commit: a3f7d2)   │   │
│  │ [Déployer maintenant]  [Configurer webhook]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page : Créer un Site
```
1. Nom du site : AI Hub
2. Domaine : ai-hub.ton-domaine.com
3. Type : Next.js 15 + PostgreSQL
4. Git repo : https://github.com/ton-repo/ai-hub.git
5. Branch : main
6. Resources : CPU 1.0 | RAM 1GB
7. [Créer et déployer]
```

---

## 7. Déploiement d'un Site — Workflow

```
1. L'utilisateur clique "Créer un site" dans le dashboard
2. Le dashboard crée un dossier /opt/sites/ai-hub/
3. Clone le repo git
4. Génère un docker-compose.yml spécifique au site
5. Démarre les containers (app + DB)
6. Configure Traefik (routing + SSL)
7. Le site est live sur https://ai-hub.ton-domaine.com

--- Git Auto-Deploy ---
8. GitHub envoie un webhook sur /webhook/ai-hub
9. Le dashboard pull le code
10. Rebuild les containers
11. Health check → si OK, switch le traffic
12. Logs du deploy dans le dashboard
```

---

## 8. Comparaison avec les Solutions Existantes

| Solution | Coût | Open Source | Multi-site | Git Deploy | Monitoring | Pourquoi pas ? |
|---|---|---|---|---|---|---|
| **cPanel** | 15$/mois | ❌ | ✅ | ❌ | Basique | Payant, vieillot |
| **Plesk** | 10$/mois | ❌ | ✅ | ❌ | Basique | Payant |
| **Coolify** | Gratuit | ✅ | ✅ | ✅ | ✅ | Bon, mais complexe |
| **CapRover** | Gratuit | ✅ | ✅ | ✅ | ❌ | Pas de monitoring intégré |
| **Multi-Host (notre solution)** | Gratuit | ✅ | ✅ | ✅ | ✅ | Sur-mesure, simple, contrôlé |

---

## 9. Feuille de Route Multi-Host

### Phase 1 : Infrastructure (Semaine 1)
- [ ] Installer Traefik + SSL auto
- [ ] PostgreSQL + Redis
- [ ] Prometheus + Grafana
- [ ] Script de création de site (CLI)

### Phase 2 : Dashboard Web (Semaine 2)
- [ ] Auth admin (login/mot de passe)
- [ ] Liste des sites
- [ ] Logs temps réel (WebSocket)
- [ ] Metrics CPU/RAM/Disque

### Phase 3 : Git Deploy (Semaine 3)
- [ ] Webhook GitHub/GitLab
- [ ] Auto-deploy sur push
- [ ] Logs de build
- [ ] Rollback (revenir au commit précédent)

### Phase 4 : Backup & Sécurité (Semaine 4)
- [ ] Backup DB 1-clic
- [ ] Backup fichiers
- [ ] Restauration
- [ ] Firewall (fail2ban)
- [ ] Updates auto (unattended-upgrades)

---

## 10. Coût Total

| Ressource | Coût mensuel |
|---|---|
| VPS 4 vCPU / 8GB RAM | 8-12€ |
| Domaine (1-5 sites) | 1-5€ |
| S3 backups (optionnel) | 0-2€ |
| **Total** | **9-19€/mois pour héberger 5+ sites** |

---

> **Vision finale** : Tu ouvres `dashboard.ton-domaine.com`, tu vois tous tes sites, tu cliques sur "Nouveau site", tu colles un lien GitHub, et 2 minutes plus tard le site est en ligne avec SSL. Zero configuration. Zero ligne de commande. Ton cPanel personnel.
