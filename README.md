# AI Hub V2

Plateforme de veille IA : classements Arena, comparateur communautaire, feed et API open-data.

## Stack

- Next.js 15 (App Router)
- Supabase / PostgreSQL (`community_votes`)
- Déploiement : [Vercel](https://ai-hub-cnb3.vercel.app)

## Développement local

```bash
npm install
cp .env.example .env.local
# Renseigner DATABASE_URL et clés Supabase
npm run dev
```

## API

- `GET/POST /api/v1/votes` — votes comparateur
- `GET /api/v1/models` — liste modèles
- `GET /api/v1/leaderboard` — classement

## SQL

Migration : `sql/community_votes.sql`
