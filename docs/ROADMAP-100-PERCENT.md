# AI Hub — Roadmap "100%" : De l'Audit à la Domination

> **Mission** : Atteindre 100% sur tous les audits (Lighthouse, WCAG, SEO, Security Headers) et devenir LA référence IA sur Google + détectable par les LLM.

---

## PHASE 0 : Fondations Critiques (Semaine 1)

### 0.1 Performance Web — Core Web Vitals

| Métrique | Objectif | Technique |
|---|---|---|
| **LCP** | < 2.5s | Images WebP/AVIF, priority loading hero, font-display: swap |
| **INP** | < 200ms | Debounce inputs, useTransition, virtual lists pour longs feeds |
| **CLS** | < 0.1 | Dimensions fixes sur images, pas de layout shift au chargement |
| **TTFB** | < 600ms | Edge runtime Vercel, streaming SSR, pas de blocking |
| **FCP** | < 1.8s | Inline critical CSS, preload fonts, preconnect CDN |

**Actions immédiates :**
- [ ] Activer `next/image` avec `sizes` et `placeholder="blur"` sur toutes les images
- [ ] Précharger les fonts critiques : `<link rel="preload" href="...Inter..." as="font" crossorigin>`
- [ ] Inline le CSS critique du hero dans `<head>` (évite FOIT/FOUT)
- [ ] Lazy load tous les composants sous la fold : `dynamic(() => import(...), { ssr: false })`
- [ ] Activer `React.StrictMode` en dev pour détecter les re-renders inutiles
- [ ] Utiliser `useMemo` + `useCallback` sur les listes > 20 items
- [ ] Virtualiser le feed si > 50 items : `react-window` ou `react-virtualized`

### 0.2 Accessibilité — WCAG 2.1 AA Obligatoire

| Critère | Implémentation |
|---|---|
| **Contraste** | Ratio 4.5:1 minimum texte/body. Vérifier `--muted-foreground` vs `--background` |
| **Focus visible** | `:focus-visible` avec `outline: 2px solid var(--ring)` sur TOUS les interactifs |
| **ARIA** | `aria-label` sur les icones boutons, `aria-current="page"` sur nav active, `role="status"` sur live indicators |
| **Alt text** | TOUS les avatars ont `alt=""` (décoratifs) ou `alt="Avatar de {name}"` (informatifs) |
| **Keyboard nav** | Tab order logique, skip link, pas de trap dans modales |
| **Réduction mouvement** | `@media (prefers-reduced-motion: reduce)` : désactiver aurora, shimmer, spin border |
| **Taille clic** | Cibles ≥ 44x44px (mobile) et ≥ 24x24px (desktop) |
| **Screen reader** | Headings hiérarchiques (pas de h3 avant h2), landmarks (`<main>`, `<nav>`, `<aside>`), live regions pour les votes |

**Actions :**
- [ ] Ajouter `aria-label` sur tous les `<Button>` qui ont juste une icône
- [ ] Vérifier le contraste de `--muted-foreground` (actuellement 0.40 → peut être trop faible, monter à 0.55)
- [ ] Ajouter un "Skip to main content" link caché sauf au focus
- [ ] Tester avec NVDA/VoiceOver : le feed doit annoncer "Nouveau post de X" si live

### 0.3 Sécurité — Headers & Protection

| Header | Valeur | Pourquoi |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.lmsys.org https://huggingface.co; frame-ancestors 'none';` | Protection XSS, clickjacking |
| `X-Frame-Options` | `DENY` | Pas d'iframe |
| `X-Content-Type-Options` | `nosniff` | Pas de MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy + analytics |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Pas de permissions inutiles |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS forcé |

**Actions :**
- [ ] Configurer les headers dans `next.config.js` (objet `headers` async)
- [ ] Rate limiting sur les API routes : `limiter` avec 100 req/min par IP
- [ ] Sanitize toutes les entrées utilisateur (votes, commentaires) avec DOMPurify côté client
- [ ] Pas de `eval()`, pas de `innerHTML` avec du contenu utilisateur
- [ ] Cookies : `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Validation Zod sur TOUTES les API routes (déjà fait → maintenir)

### 0.4 SEO Fondamental — Technique

**On-page SEO :**
- [ ] Sitemap XML dynamique : `/sitemap.xml` avec toutes les routes + lastmod
- [ ] Robots.txt : `Allow: /`, `Sitemap: https://ai-hub.com/sitemap.xml`
- [ ] Canonical tags sur toutes les pages (déjà fait dans metadata)
- [ ] Structured Data JSON-LD sur chaque page :
  - Home : `Organization` + `WebSite` (avec `potentialAction` SearchAction)
  - /compare : `FAQPage` + `HowTo`
  - /ranking : `Dataset` + `Table`
  - Chaque post : `Article` ou `NewsArticle`
- [ ] BreadcrumbList JSON-LD sur toutes les pages
- [ ] Open Graph : déjà fait, mais vérifier `og:image` est absolu (pas relatif)
- [ ] Twitter Cards : `summary_large_image`, vérifier dimensions 1200x630

**Actions :**
- [ ] Créer `app/sitemap.ts` (route dynamique Next.js)
- [ ] Créer `app/robots.ts`
- [ ] Créer un composant `JsonLd` réutilisable pour injecter les schema.org

---

## PHASE 1 : SEO Avancé — Capturer le Trafic IA (Semaine 2)

### 1.1 Keyword Strategy — 50+ Landing Pages

AI Hub doit apparaître pour CES recherches :

| Volume de recherche | Mot-clé cible | Page à créer |
|---|---|---|
| Haut | "meilleur modèle IA 2026" | `/best-ai-models-2026` |
| Haut | "comparer GPT-4o vs Gemini" | `/compare/gpt-4o-vs-gemini-2-5-pro` |
| Haut | "classement IA" | `/ranking` (existe) |
| Moyen | "benchmark code IA" | `/hub/coding` |
| Moyen | "modèle IA français" | `/hub/french` |
| Moyen | "LLM open source" | `/hub/open-source` |
| Longue traîne | "Claude 3.7 Sonnet vs o3 coding" | `/compare/claude-3-7-vs-o3?cat=coding` |
| Longue traîne | "Gemini 2.5 Pro écriture créative" | `/model/gemini-2-5-pro` |

**Actions :**
- [ ] Créer 10+ pages de comparaison statiques (pré-rendered) : `/compare/[modelA]-vs-[modelB]`
- [ ] Créer des pages modèles individuelles : `/model/[slug]` avec fiche complète
- [ ] Chaque page a un H1 unique, meta description unique, JSON-LD unique
- [ ] Internal linking : chaque page modèle link vers 5 comparaisons + 3 hubs

### 1.2 AI Discoverability — Être Cité par les LLM

Les LLM (ChatGPT, Claude, Gemini, Perplexity) citent des sites qu'ils "connaissent". Comment être dans leur corpus :

| Technique | Implémentation |
|---|---|
| **Structured data riche** | `Dataset`, `Organization`, `FAQPage`, `HowTo` — les LLM parse ça |
| **Contenu original et cité** | Nos benchmarks communautaires sont UNIQUES → les LLM vont citer ça |
| **Open data** | Dataset JSON/CSV téléchargeable → les LLM vont le scraper |
| **Réponses directes** | Chaque page a une section "Résumé" ou "TL;DR" en début de page (format Q&A que les LLM aiment) |
| **FAQ Schema** | FAQPage sur chaque page de comparaison |
| **HowTo Schema** | "Comment choisir un modèle IA pour le code" → HowTo structuré |

**Actions :**
- [ ] Ajouter une section "TL;DR" en haut de chaque page modèle (3-4 phrases, réponse directe)
- [ ] Créer un endpoint `/api/dataset/leaderboard.json` (open data)
- [ ] Créer un endpoint `/api/dataset/models.json` (open data)
- [ ] Page `/about` avec WhoWeAre, méthodologie, sources (crédibilité pour les LLM)

### 1.3 Core Web Vitals — Page Experience

Google rank les sites avec bon CWV plus haut.

- [ ] `next/image` partout avec `priority` sur LCP elements
- [ ] `fetchpriority="high"` sur l'image hero
- [ ] Preconnect + DNS prefetch vers les domaines externes (fonts.googleapis.com, api.lmsys.org)
- [ ] Service Worker pour cache offline (PWA)
- [ ] Pas de render-blocking JS en `<head>`

### 1.4 Mobile-First Indexing

Google est mobile-first depuis 2019.

- [ ] Tester TOUS les layouts sur 320px (iPhone SE)
- [ ] Touch targets ≥ 44px
- [ ] Pas de texte qui déborde horizontalement
- [ ] Pas de zoom forcé sur inputs
- [ ] Performance 3G : bundle < 100KB initial

---

## PHASE 2 : Expérience Utilisateur Ultime (Semaine 3)

### 2.1 Micro-Interactions & Polish

| Interaction | Implémentation |
|---|---|
| **Loading states** | Skeletons partout, pas de spinners centrés vides |
| **Optimistic UI** | Vote +1 instantané, rollback si erreur |
| **Toast notifications** | Sonner pour : "Vote enregistré", "Erreur réseau", "Nouveau post" |
| **Error boundaries** | Page d'erreur stylée avec retry button, pas de crash blanc |
| **Empty states** | Illustration + CTA quand aucun résultat (pas de "No data") |
| **Progressive enhancement** | Ça marche sans JS (SSR) → s'améliore avec JS |
| **Prefetch** | `<Link prefetch>` sur les liens de navigation principaux |
| **Instant search** | Debounce 150ms, résultats en temps réel |

### 2.2 PWA — App-like Experience

- [ ] `manifest.json` avec icons, theme_color, display: standalone
- [ ] Service Worker avec `workbox` pour cache offline
- [ ] Install prompt personnalisé (pas le browser default)
- [ ] Background sync pour les votes offline
- [ ] Push notifications : "Gemini vient de passer #1 !"

### 2.3 Dark Mode Perfection

- [ ] Testé en conditions réelles : pas de couleurs qui piquent
- [ ] `--foreground` à 0.92 (pas blanc pur, moins agressif)
- [ ] `--muted-foreground` à 0.55 (pas 0.40, trop faible pour la lecture)
- [ ] Pas de dégradés sombre→noir trop fort (banding sur écrans bas de gamme)
- [ ] `color-scheme: dark` sur `<html>` (scrollbars, inputs natifs)

---

## PHASE 3 : Infrastructure & Évolutivité (Semaine 4)

### 3.1 Base de Données

**Besoin** : Persister les votes, utilisateurs, profils, streaks.

| Option | Avantage | Inconvénient |
|---|---|---|
| **Supabase** (PostgreSQL) | Gratuit tier, Auth intégré, Realtime | Limité à 500MB |
| **PlanetScale** (MySQL) | Serverless, scaling automatique | Payant après 5GB |
| **Neon** (PostgreSQL) | Serverless, branching | Payant après 0.5GB |
| **Vercel KV** (Redis) | Ultra rapide, edge | Pas relationnel |

**Recommandation** : **Supabase** pour commencer (auth + DB + realtime en un seul).

Schéma minimal :
```sql
users (id, email, username, avatar, reputation, created_at)
votes (id, user_id, benchmark_id, choice, created_at)
profiles (user_id, streak, badges[], total_votes, last_active)
leaderboard_cache (category, model, wins, losses, elo, updated_at)
```

### 3.2 Auth — Identité Communautaire

| Provider | Pourquoi |
|---|---|
| **GitHub OAuth** | Audience tech, profil public existant |
| **Google OAuth** | Friction minimale |
| **Magic Link** | Pas de mot de passe à gérer |
| **Anonymous** | Voter sans compte (stocké en localStorage, migrable) |

**Actions :**
- [ ] Auth via Supabase Auth (GitHub + Google + Magic Link)
- [ ] Profil public : `/u/[username]` avec stats, badges, votes
- [ ] Anonymous voting avec fingerprinting (pas de compte requis pour voter)

### 3.3 Real-time

- [ ] Supabase Realtime pour les votes en direct
- [ ] WebSocket pour le leaderboard live
- [ ] Server-Sent Events pour les nouveaux posts
- [ ] `unstable_cache` de Next.js pour les données statiques (LMSYS)

### 3.4 Analytics — Comprendre les Utilisateurs

| Outil | Usage |
|---|---|
| **Plausible** | Privacy-friendly, pas de cookie banner requis (GDPR) |
| **Vercel Analytics** | Core Web Vitals tracking |
| **PostHog** | Funnels, heatmaps, session replay |

**Events à tracker :**
- Vote sur un benchmark
- Changement de catégorie
- Clic sur un modèle dans le leaderboard
- Scroll depth sur le feed
- Temps passé sur /compare

---

## PHASE 4 : Distribution — Aller Chercher les Gens (Semaine 5)

### 4.1 Bot Twitter/X (@AIHubBenchmarks)

- [ ] Tweet automatique quand un modèle change de position dans le top 5
- [ ] Thread quotidien : "AI Hub Daily Digest"
- [ ] Répondre aux mentions avec le classement actuel
- [ ] Hashtags : #AIbenchmark #LLM #GPT4o #Gemini

### 4.2 Newsletter

- [ ] Revue/Substack : "AI Hub Weekly" — résumé des changements
- [ ] Inscription dans le footer de chaque page
- [ ] CTA : "Recevez le classement chaque lundi"

### 4.3 Extension Navigateur

- [ ] Chrome/Firefox extension
- [ ] Sur chat.openai.com → badge "#3 sur AI Hub"
- [ ] Popup avec leaderboard actuel

### 4.4 API Publique

- [ ] GET `/api/v1/models` — tous les modèles
- [ ] GET `/api/v1/leaderboard?category=` — classement
- [ ] GET `/api/v1/papers` — papers du jour
- [ ] Rate limit : 100 req/min, pas de clé API requise en lecture
- [ ] Documentation sur `/docs/api`

### 4.5 Open Data

- [ ] Export CSV hebdomadaire du leaderboard
- [ ] Export JSON des votes (anonymisés)
- [ ] GitHub repo : `ai-hub/datasets` avec historique

---

## PHASE 5 : Gamification & Communauté (Semaine 6)

### 5.1 Système de Réputation

| Action | Points |
|---|---|
| Voter un benchmark | 1 pt |
| Poster un test détaillé | 5 pts |
| Être upvoted | 2 pts |
| Streak 7 jours | 10 pts bonus |
| Inviter un ami | 15 pts |

### 5.2 Badges

- "Early Adopter" — compte créé avant 10k utilisateurs
- "Benchmarker" — 100 votes
- "Paper Hunter" — 10 posts avec source papier
- "ELO Watcher" — consulté le leaderboard 30 jours de suite
- "Top 5%" — dans le top 5% des contributeurs

### 5.3 Hubs Thématiques

- `/hub/coding` — feed spécifique code
- `/hub/french` — modèles francophones
- `/hub/open-source` — LLM open weight
- Chaque hub a son propre leaderboard, modérateurs, feed

### 5.4 Profil Public

- `/u/[username]` avec : modèles testés, badges, streak, contributions
- "Contributeur top 5% sur le hub Coding"
- Partageable sur Twitter avec card OG

---

## PHASE 6 : Content Strategy — Le SEO Long Terme (Semaine 7+)

### 6.1 Blog / Guides

| Article cible | Mot-clé | Objectif |
|---|---|---|
| "Quel modèle IA choisir en 2026 ?" | "meilleur modèle IA" | Featured snippet |
| "GPT-4o vs Gemini 2.5 Pro : le test complet" | "gpt-4o vs gemini" | Page 1 Google |
| "Les meilleurs modèles pour coder" | "meilleur IA pour programmer" | Trafic dev |
| "IA et français : le classement" | "modèle IA français" | Niche française |
| "Comment interpréter un benchmark IA" | "benchmark IA" | Autorité |

### 6.2 User Generated Content = SEO Gold

Chaque vote, chaque test utilisateur = contenu unique indexable.
- [ ] Page `/test/[id]` pour chaque test détaillé (indexable)
- [ ] Commentaires sur les comparaisons (indexables si qualité)
- [ ] Profils publics avec stats (indexables)

### 6.3 Backlink Strategy

| Action | Cible |
|---|---|
| Soumettre sur Hacker News "Show HN" | Trafic tech + backlink |
| Poster sur r/MachineLearning | Backlink + trafic qualifié |
| Répondre sur Stack Overflow avec lien pertinent | Backlink authority |
| Guest post sur blog IA francophone | Backlink + audience |
| Créer un dataset et le publier sur HuggingFace | Backlink + crédibilité |

---

## PHASE 7 : L'Audit Final — Checklist 100%

### 7.1 Lighthouse — Objectif : 100/100/100/100

- [ ] Performance : 100
- [ ] Accessibilité : 100
- [ ] Best Practices : 100
- [ ] SEO : 100

### 7.2 Security Headers — Objectif : A+

- [ ] https://securityheaders.com → Grade A+
- [ ] CSP strict sans `unsafe-inline` (utiliser nonce)
- [ ] HSTS preload ready

### 7.3 WCAG 2.1 AA — Objectif : 0 erreur

- [ ] axe DevTools : 0 violations
- [ ] WAVE : 0 errors
- [ ] Keyboard navigation fluide
- [ ] Screen reader testé

### 7.4 Google Search Console — Objectif : 0 issue

- [ ] Sitemap soumis et validé
- [ ] Pas de pages en "Crawled - currently not indexed"
- [ ] Core Web Vitals : "Good" sur mobile ET desktop
- [ ] Pas de mobile usability issues
- [ ] Rich Results Test : toutes les pages passent

### 7.5 Core Web Vitals — Objectif : Tout en vert

- [ ] LCP < 2.5s (mobile)
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms

---

## Checklist Globale — Avant Chaque Déploiement

- [ ] `npm run build` passe sans erreur
- [ ] Lighthouse ≥ 95 sur toutes les pages
- [ ] Aucune régression design (comparer visuellement)
- [ ] Les liens internes fonctionnent (pas de 404)
- [ ] Les API routes répondent (< 200ms)
- [ ] Pas de données hardcodées en prod (toujours fallback)
- [ ] Les analytics fonctionnent (vérifier PostHog/Plausible)
- [ ] Le sitemap est à jour

---

## Ressources & Outils

| Outil | URL | Usage |
|---|---|---|
| Lighthouse | Chrome DevTools | Performance audit |
| axe DevTools | Extension Chrome | Accessibilité |
| WAVE | https://wave.webaim.org | Accessibilité |
| securityheaders.com | https://securityheaders.com | Headers |
| PageSpeed Insights | https://pagespeed.web.dev | CWV + suggestions |
| Schema Markup Validator | https://validator.schema.org | Structured data |
| Rich Results Test | https://search.google.com/test/rich-results | Google rich results |
| GTmetrix | https://gtmetrix.com | Performance détaillée |

---

> **Ce document est la feuille de route jusqu'à la domination.** Chaque phase construit sur la précédente. On ne saute pas d'étape. On ne déploie pas sans checklist.
