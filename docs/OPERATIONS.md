# AI Hub — Operations (long-term)

## Health check

- `GET /api/health` — returns `healthy` or `degraded`
- Monitor every 1–5 min (UptimeRobot, Vercel, etc.)

## Required production env (Vercel)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase **transaction pooler** URI (port 6543) — persists votes & posts |
| `NEXT_PUBLIC_APP_URL` | `https://ai-hub-cnb3.vercel.app` — CORS |

Without `DATABASE_URL`, duels/posts use `/tmp` or memory (not durable across instances).

## Data sources

| Data | Source | Refresh |
|------|--------|---------|
| ELO / votes Arena | GitHub mirror → Chatbot Arena | 5 min cache |
| Feed news | Hugging Face Papers + arXiv | 5 min cache |
| Duel votes | Postgres `community_votes` | Real-time |

Fallback ranking (`arena-ai-fallback`) = orange banner; not live Arena.

## Deploy

```bash
git push origin main
# Vercel auto-deploy
```

Verify after deploy:

1. `curl https://ai-hub-cnb3.vercel.app/api/health`
2. Home page loads (200)
3. Compare → vote → no error
4. `/api/v1/stats` shows `persisted: true` if DB ok

## Database migrations

**Recommandé :** nouveau projet Supabase — voir `docs/SUPABASE-FRESH-SETUP.md`.

Tables auto-create on first API call. For manual setup, run once in SQL Editor:

- `sql/00_full_schema.sql` (ou `community_votes.sql` + `social.sql`)

## Incident playbook

| Symptom | Action |
|---------|--------|
| 500 on home | Check `/api/health`, Vercel logs, Arena mirror availability |
| Votes fail | Confirm `DATABASE_URL`, Supabase not paused, pooler mode |
| Stale ELO | Expected if Arena mirror down; fallback is documented to users |

## Security

- Rate limits: 30 votes/min, 10 posts/min per IP
- No auth yet — do not expose admin endpoints
- Rotate Supabase DB password if leaked; never commit `.env`
