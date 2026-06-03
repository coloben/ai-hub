# Supabase — repartir à neuf (recommandé)

L’ancien projet `khkxpfherpyugfdecmrv` date de la V1 (auth, tables possibles, clés peut‑être exposées en chat).
**AI Hub V2 n’utilise pas Supabase Auth** pour l’instant — seulement **Postgres** via `DATABASE_URL`.

→ **Créer un nouveau projet Supabase** est plus simple et plus sûr que de nettoyer l’ancien.

---

## Ce qu’on ne refait pas

| Élément | Action |
|---------|--------|
| Code `lib/db.ts`, `pg-store`, votes | **Garder** — déjà adapté V2 |
| Packages `@supabase/*` | **Garder** installés pour la phase Auth plus tard |
| Arena / arXiv / HF | **Rien à voir** avec Supabase |

On refait uniquement : **projet Supabase + 4 tables + variables Vercel**.

---

## Étape 1 — Nouveau projet (5 min)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Nom suggéré : `ai-hub-prod` (ou `ai-hub-v2`)
3. Région : proche de tes users (ex. `eu-central-1`)
4. Mot de passe DB : **générer fort** → noter dans un gestionnaire de mots de passe
5. Attendre que le projet soit **Active**

---

## Étape 2 — Schéma SQL (2 min)

1. **SQL Editor** → New query
2. Coller tout le fichier `sql/00_full_schema.sql`
3. **Run**

Tables créées :

- `community_votes` — duels /compare
- `social_posts`, `social_post_votes`, `social_comments` — feed communauté

---

## Étape 3 — URI pour Vercel (important)

**Ne pas** utiliser l’URI « Direct » (port 5432) sur Vercel serverless.

1. **Project Settings → Database**
2. **Connection string** → onglet **ORM** ou **URI**
3. Mode : **Transaction pooler** (port **6543**)
4. Copier l’URI ; elle ressemble à :

```txt
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Ajouter si absent : `?pgbouncer=true`

---

## Étape 4 — Variables Vercel

Projet `ai-hub-cnb3` → **Settings → Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URI pooler (étape 3) |
| `NEXT_PUBLIC_APP_URL` | `https://ai-hub-cnb3.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT_REF].supabase.co` (pour plus tard) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role (**secret**, jamais côté client) |

Puis **Redeploy** la branche `main`.

---

## Étape 5 — Vérification

```bash
curl -s https://ai-hub-cnb3.vercel.app/api/v1/stats | jq '.persistence, .community.persisted'
```

Attendu :

```json
{
  "databaseConfigured": true,
  "communityPersisted": true
}
```

Tester à la main :

1. `/compare` → voter un duel
2. `/` → publier un post test
3. Redeploy Vercel → les données doivent **rester**

---

## Ancien projet `khkxpfherpyugfdecmrv`

Après validation prod :

1. **Pause project** (gratuit) ou export backup si tu avais des données utiles
2. **Révoquer** les anciennes clés API si elles ont été partagées
3. Mettre à jour `.env.local` avec les **nouvelles** clés uniquement

---

## Phase 2 (plus tard) — Auth sur le même projet

Quand tu activeras Supabase Auth :

1. Auth → Providers (GitHub / Google)
2. Nouvelles tables `profiles` + RLS sur `social_*`
3. Remplacer profil `localStorage` par session Supabase

Le schéma actuel reste valide ; on **ajoute** des colonnes/tables, sans tout casser.

---

## Dépannage

| Symptome | Cause | Fix |
|----------|--------|-----|
| `persisted: false` | `DATABASE_URL` absent ou mauvais deploy | Vercel env + redeploy |
| `ECONNRESET` / timeout | URI direct 5432 au lieu du pooler | Port **6543** transaction |
| Votes OK, posts KO | SQL social non exécuté | Relancer `00_full_schema.sql` |
| SSL error | URI mal formée | `ssl` géré dans `lib/db.ts` pour `supabase` |
