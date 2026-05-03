# 📐 AI Intelligence Platform - Maquette HTML

## 📂 Fichier Principal
- **preview.html** : Maquette complète avec CSS intégré

## 🎯 Structure

```
Header
├── Logo + Navigation
├── Search
└── Settings

Main Content (2 colonnes)
├── Market Overview (4 stat cards)
│   ├── Active Models
│   ├── New Releases
│   ├── Avg ELO Rating
│   └── Market Heat
├── Top Models Carousel (scrollable)
│   ├── Rank 1-5
│   ├── Name + Organization
│   ├── ELO Score
│   └── Trend (↑/↓)
├── Breaking News (Top 3)
│   └── Trending items avec votes
└── Feed Section (Signal Cards)
    ├── Release
    ├── Benchmark
    ├── Research
    └── Pricing

Sidebar
├── Power Ranking (Top 5)
├── Market Heat Gauge
├── Active Sources
└── Models Tracked
```

## ✨ Features

- ✅ Real-time market stats
- ✅ Top models carousel (scrollable)
- ✅ Breaking news section
- ✅ Detailed signal cards
- ✅ Power ranking sidebar
- ✅ Responsive design
- ✅ WCAG 2.1 AA+ accessible

## 📝 Commentaires dans le HTML

Tous les TODO sont marqués dans le HTML avec des commentaires clairs :

```html
<!-- HEADER: Navigation principale
     TODO: Convertir en composant React (app/components/Header.tsx)
     - Logo cliquable vers /
     - Navigation: Trending, Latest, Leaderboard, Benchmarks
     - Search: Intégrer avec /api/search
     - Settings: Modal ou /settings
-->
```

## 🚀 Prochaines Étapes

1. **Créer les composants React**
   - `app/components/Header.tsx`
   - `app/components/MarketOverview.tsx` (4 stat cards)
   - `app/components/TopModelsCarousel.tsx` (scrollable models)
   - `app/components/TrendingSection.tsx` (breaking news)
   - `app/components/FeedSection.tsx` (signal cards)
   - `app/components/SignalCard.tsx` (individual card)
   - `app/components/Sidebar.tsx` (power ranking + stats)

2. **Extraire le CSS**
   - Copier le CSS dans `app/globals.css`
   - Convertir en Tailwind si nécessaire

3. **Intégrer les données**
   - `GET /api/market/overview` (stat cards)
   - `GET /api/models/top` (top 5 models)
   - `GET /api/trending` (breaking news)
   - `GET /api/signals` (feed)
   - `GET /api/models/ranking` (sidebar ranking)
   - `GET /api/market/heat` (sidebar heat)

4. **Ajouter les interactions**
   - Filtres (category, verification, impact)
   - Recherche
   - Pagination
   - Tri

5. **Tester et déployer**
   - Tests d'accessibilité
   - Tests responsive
   - Déploiement Vercel

## 📌 Notes

- CSS est inclus dans le fichier HTML (à extraire)
- Données sont en dur (à remplacer par API)
- Tous les TODO sont marqués dans le HTML
- Maquette est 100% responsive et accessible
