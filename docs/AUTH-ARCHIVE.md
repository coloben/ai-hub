# Auth — Archivé pour Phase 2

> **Statut** : PAS implémenté dans la version actuelle  
> **Raison** : Complexité + risque d'instabilité (expérience précédente négative avec Google/GitHub OAuth)  
> **Priorité** : Phase 2, après le déploiement initial et la traction utilisateur  

---

## Ce qui a été essayé (et retiré)

- ❌ **Supabase Auth** — packages installés (`@supabase/supabase-js`, `@supabase/ssr`) mais non utilisés
- ❌ **Google OAuth** — problèmes de configuration, redirect URI mismatch
- ❌ **GitHub OAuth** — complexité avec les Server Components Next.js 15

## Pourquoi on attend

1. **Le benchmark fonctionne sans auth** — les votes sont anonymes via `localStorage` + fingerprinting
2. **L'auth complexifie le build** — middleware, cookies, session management = plus de points de défaillance
3. **On peut mesurer l'intérêt d'abord** — si personne ne vote, pas besoin de comptes

## Quand on l'activera

| Critère | Seuil |
|---|---|
| Votes par jour | > 100 |
| Visiteurs uniques / mois | > 5 000 |
| Demandes de profil public | > 10 |

## Spécifications futures (à implémenter plus tard)

### Option A : Supabase (rapide, mais vendor lock-in)
```
- Supabase Auth (email + OAuth)
- Supabase PostgreSQL
- Supabase Realtime (votes en direct)
```

### Option B : Auth.js + PostgreSQL local (auto-hébergé)
```
- NextAuth.js v5 (Auth.js)
- Providers : GitHub, Google, Credentials (email/pass)
- Adapter : `pg` (PostgreSQL local)
- Session : JWT côté client + refresh token côté serveur
```

### Option C : Auth interne maison (max contrôle)
```
- bcrypt pour les mots de passe
- JWT signé avec clé secrète
- Refresh tokens stockés en PostgreSQL
- OAuth GitHub/Google via Passport.js ou manuel
```

## Profil utilisateur (spécifications)

```typescript
interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string
  avatar: string
  banner: string        // Twitter-like banner
  location: string
  website: string
  reputation: number
  streak: number
  badges: Badge[]
  joinedAt: Date
  // Stats
  totalVotes: number
  totalTests: number
  topCategory: string
  // Social
  followers: number
  following: number
}
```

## Implémentation planifiée

| Tâche | Estimation | Dépendances |
|---|---|---|
| Schéma DB users + auth | 1h | PostgreSQL disponible |
| API login/register | 2h | Schéma DB |
| OAuth GitHub | 1h | App GitHub créée |
| OAuth Google | 1h | App Google Console |
| Page profil `/u/[username]` | 3h | Auth fonctionnelle |
| Système de badges | 2h | Reputation calculée |
| Votes persistés (liés à user) | 1h | Auth + DB |
| Real-time leaderboard | 2h | WebSocket ou SSE |

**Total estimé : 2-3 jours de développement.**

---

> **Note** : Ne PAS implémenter avant d'avoir des preuves de traction. Un site rapide et stable sans auth > un site lent avec auth cassée.
