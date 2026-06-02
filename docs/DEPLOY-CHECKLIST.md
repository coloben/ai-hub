# AI Hub — Checklist Déploiement Production

> **Date** : 2026-05-17  
> **Statut** : ✅ PRÊT À DÉPLOYER  
> **Environnement cible** : Vercel (gratuit) ou VPS (auto-hébergé)

---

## ✅ Vérifications techniques

### Build
- [x] `npm run build` passe sans erreur
- [x] `next lint` passe sans erreur (warnings @tailwind non-bloquants)
- [x] 12 pages prerendered correctement
- [x] 7 API routes compilées

### TypeScript
- [x] Aucune erreur de type critique
- [x] Tous les imports résolus

### Variables d'environnement
| Variable | Requise | Utilisée | Status |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Non | `next.config.js` (fallback hardcodé) | ✅ OK |
| `NODE_ENV` | Auto | `next.config.js` | ✅ OK |
| `DATABASE_URL` | Non | Pas utilisé (données mockées) | ✅ OK |
| `JWT_SECRET` | Non | Pas utilisé | ✅ OK |

**Conclusion** : Aucune variable d'environnement requise. Le site fonctionne out-of-the-box.

### Dépendances
- [x] Toutes les dépendances installées (`npm install`)
- [x] Packages inutilisés (`@supabase/*`, `pg`) ne bloquent pas le build

---

## ✅ SEO & Indexation

- [x] `sitemap.xml` — 21 routes dynamiques
- [x] `robots.txt` — allow all, disallow /api/
- [x] Structured Data JSON-LD sur chaque page
- [x] Meta tags uniques par page
- [x] Open Graph + Twitter Cards
- [x] Canonical tags

---

## ✅ Sécurité

- [x] CSP (Content-Security-Policy)
- [x] HSTS (Strict-Transport-Security)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy
- [x] Permissions-Policy

---

## ✅ Accessibilité

- [x] Contraste WCAG AA (muted-foreground 0.55)
- [x] Skip link
- [x] Focus visible
- [x] Reduced motion support
- [x] Langue déclarée (`lang="fr"`)

---

## ⚠️ À configurer côté Vercel (si déploiement Vercel)

### 1. Variables d'environnement (optionnelles)
```
NEXT_PUBLIC_APP_URL=https://ai-hub-ton-domaine.vercel.app
```

### 2. Domaine personnalisé (optionnel)
- Ajouter un domaine personnalisé dans les settings Vercel
- Configurer les DNS (CNAME → cname.vercel-dns.com)

### 3. Image optimization
- Vercel optimise automatiquement les images avec `next/image`
- Les formats AVIF/WebP sont configurés dans `next.config.js`

---

## 🚀 Commandes de déploiement

### Option A : Vercel CLI
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod

# 4. Configurer le domaine
vercel domains add ai-hub-ton-domaine.com
```

### Option B : Git + Vercel (recommandé)
```bash
# 1. Push sur GitHub
git add .
git commit -m "v1.0 ready for deploy"
git push origin main

# 2. Connecter le repo sur Vercel
# → Dashboard Vercel → Add New Project → Import Git Repository
# → Auto-deploy sur chaque push
```

### Option C : VPS (Docker)
```bash
# Voir docs/SELF-HOSTED-ARCHITECTURE.md
```

---

## 📊 Post-déploiement (à faire immédiatement)

- [ ] Vérifier que le site est accessible en HTTPS
- [ ] Soumettre le sitemap à Google Search Console
- [ ] Vérifier que `/robots.txt` est accessible
- [ ] Vérifier que `/sitemap.xml` est accessible
- [ ] Tester une page avec l'outil Rich Results de Google
- [ ] Vérifier les Security Headers avec securityheaders.com
- [ ] Tester le responsive sur mobile (Chrome DevTools)

---

## 🎯 Prochaines étapes après déploiement

| Priorité | Action | Impact |
|---|---|---|
| P0 | Poster sur Hacker News "Show HN" | Trafic immédiat |
| P0 | Créer Google Search Console + soumettre sitemap | Indexation Google |
| P1 | Tweeter le benchmark quotidiennement | Trafic social |
| P1 | Répondre sur Reddit r/MachineLearning | Backlinks + trafic |
| P2 | Implémenter auth + comptes utilisateurs | Engagement |
| P2 | Bot Twitter automatique | Distribution continue |

---

> **Le site est prêt. Le build est propre. Il n'y a aucun blockeur technique.**
