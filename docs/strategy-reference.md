# AI Hub — Stratégie : De "Site Basic" à "Référence Internet"

> Date : 2026-05-17 | Statut : Phase 2 (Design + Pipeline validés)

---

## 1. Diagnostic Brutal — Ce qui manque pour être une référence

### Ce qu'on a déjà (fort)
- ✅ Design system unique et cohérent (Neo-Cyan)
- ✅ Pipeline de données LMSYS + HuggingFace Papers
- ✅ Layout social network (feed + sidebars)
- ✅ API routes avec cache + fallback

### Ce qui manque (critique)
| Gap | Pourquoi c'est bloquant | Exemple de référence |
|---|---|---|
| **Pas de data unique** | On agrège, on ne produit rien | LMSYS Arena = LE leaderboard parce qu'ils ont LEURS votes |
| **Pas de communauté réelle** | Pas de login = pas de profils = pas de follow = pas de feed perso | Reddit sans comptes = un blog |
| **Pas de vitesse** | Cache 1h = on est lent | Hacker News : un post apparaît en 30 secondes |
| **Pas d'API ouverte** | Personne ne peut construire sur nous | GitHub sans API = un viewer de code |
| **Pas de gamification** | Les gens ne reviennent pas | Stack Overflow sans karma = un forum mort |
| **Pas de distribution** | On attend les gens, on ne va pas les chercher | Product Hunt sans Twitter = une tombe |
| **Pas de recherche** | Impossible de retrouver un modèle ou un benchmark | arXiv sans recherche = une bibliothèque sans index |

---

## 2. La Formule des Références Internet

Toutes les plateformes qui sont devenues LA référence dans leur domaine ont ces 4 piliers :

```
┌─────────────────────────────────────────────────────────────┐
│                    PILIER 1 : DATA UNIQUE                    │
│  Tu produis ou organises des données que personne n'a     │
│  LMSYS = votes crowdsourced | GitHub = code + historique    │
├─────────────────────────────────────────────────────────────┤
│                   PILIER 2 : BOUCLE SOCIALE                  │
│  Les utilisateurs créent de la valeur pour les autres       │
│  Stack Overflow = Q&A | Reddit = upvotes + comments       │
├─────────────────────────────────────────────────────────────┤
│                   PILIER 3 : DISTRIBUTION                  │
│  Tu es là où ton audience est, avant qu'elle vienne à toi   │
│  Product Hunt = Twitter + Newsletter | HN = Twitter tech    │
├─────────────────────────────────────────────────────────────┤
│                   PILIER 4 : VITESSE                        │
│  Tu es le premier ou le plus rapide sur l'info              │
│  Hacker News | arXiv | Google Trends                      │
└─────────────────────────────────────────────────────────────┘
```

**AI Hub aujourd'hui** : Pilier 1 partiel (on agrège, on ne produit pas), Pilier 2 inexistant, Pilier 3 inexistant, Pilier 4 faible.

---

## 3. Plan de Bataille — 4 Sprints pour devenir indispensable

### SPRINT 1 : Data Propriétaire (2 semaines)
**Objectif** : Créer des données que personne d'autre n'a.

- **Benchmark AI Hub** : Comparateur communautaire où les gens votent A vs B
  - Pas juste ELO, mais "mieux pour le code ?", "mieux pour le français ?"
  - Catégories : Code, Créativité, Raisonnement, Français, Multimodal
  - Leaderboard par catégorie + global
- **AI Hub Score** : Algorithme composite qui agrège LMSYS + nos votes + arXiv citations
  - Formule publique, transparente
  - Poids : LMSYS (40%) + Votes communauté (35%) + Citations papers (25%)
- **Daily Digest** : Algo qui génère chaque matin un résumé des changements
  - "+3 modèles ce week-end", "Gemini 2.5 Pro passe #1", "Nouveau paper sur reasoning"
  - Exporté en newsletter + tweet thread automatique

**Livrable** : Le site devient LA source pour "Quel est le meilleur modèle IA aujourd'hui ?"

---

### SPRINT 2 : Communauté + Gamification (2 semaines)
**Objectif** : Les gens reviennent pour les autres, pas pour le contenu.

- **Système de réputation** (pas juste likes)
  - Points pour : voter un benchmark (1pt), poster un test (5pt), être upvoted (2pt)
  - Badges : "Early Adopter", "Benchmarker", "Paper Hunter", "ELO Watcher"
  - Streaks : "7 jours de suite sur AI Hub" = bonus
  - Classement des contributeurs (global + par hub)
- **Hubs thématiques** (pas juste un feed global)
  - /hub/coding, /hub/french, /hub/multimodal, /hub/open-source
  - Chaque hub a son propre feed, leaderboard, modérateurs
  - Rejoint = notifications sur ce hub
- **Profil public** avec stats
  - Modèles testés, benchmarks votés, badges, streak
  - "Contributeur top 5% sur le hub Coding"

**Livrable** : Tu crées un compte pour la réputation, pas pour poster.

---

### SPRINT 3 : Distribution (1 semaine)
**Objectif** : Être là où les gens sont. Ne pas attendre qu'ils viennent.

- **Bot Twitter/X** (@AIHubBenchmarks)
  - Tweet automatique quand un modèle change de place dans le top 5
  - Thread quotidien avec le résumé AI Hub
  - Répond aux @ avec le classement actuel
- **Newsletter quotidienne** (Substack ou Revue)
  - "AI Hub Daily — 17 Mai 2026"
  - 5 modèles en trend, 3 papers du jour, 1 comparaison chaude
  - CTA : "Voter sur AI Hub" → ramène du trafic
- **Discord bot**
  - Commande `!leaderboard` → top 10 actuel
  - Commande `!compare gemini-vs-gpt` → résultat dernier vote
  - Webhook : alerte quand nouveau benchmark publié
- **Extension navigateur**
  - Sur chat.openai.com, claude.ai, gemini.google.com → badge "#3 sur AI Hub"
  - Petit popup avec le classement actuel

**Livrable** : Même si quelqu'un n'a jamais entendu parler d'AI Hub, il voit nos données ailleurs.

---

### SPRINT 4 : Vitesse + Openness (1 semaine)
**Objectif** : Être le plus rapide et le plus ouvert.

- **Real-time updates**
  - WebSocket ou Server-Sent Events pour le classement ELO
  - Push notification : "Gemini 2.5 Pro vient de passer #1 !"
  - Dashboard live : graphique ELO qui se met à jour en direct
- **API publique documentée**
  - GET /api/v1/models → tous les modèles avec scores
  - GET /api/v1/leaderboard → classement actuel
  - GET /api/v1/papers → papers du jour
  - Rate limit généreux : 100 req/min gratuit
  - Pas de clé API requise pour lire (comme Hacker News)
- **Open Data**
  - Export CSV hebdomadaire du leaderboard
  - Export JSON de tous les votes communautaires
  - GitHub repo avec les datasets historiques

**Livrable** : Des développeurs construisent des apps avec notre API. C'est comme ça qu'on devient infrastructure.

---

## 4. La Ligne Rouge — Ce qui fait qu'on ne deviendra JAMAIS une référence

Si on fait ces erreurs, on reste un site sympa :

- ❌ **Ne pas avoir de data unique** → on est un agrégateur, pas une référence
- ❌ **Ne pas ouvrir l'API** → on est un silo, pas une plateforme
- ❌ **Ne pas aller chercher les gens** → on est un site, pas un écosystème
- ❌ **Avoir peur de la communauté** → modération stricte > pas de communauté
- ❌ **Vouloir tout contrôler** → Hacker News a 1 modérateur. Stack Overflow est 99% communautaire.

---

## 5. Ce qui nous donne un avantage sur les multinationales

| Multinationale | Pourquoi ils ne peuvent pas faire ça | Notre avantage |
|---|---|---|
| **OpenAI** | Conflict of interest (ils vendent GPT) | Neutre, impartial |
| **Google** | Corporate voice, pas de communauté | Vrai ton humain, edgy |
| **Anthropic** | Pas d'API publique de benchmarks | Open data by default |
| **Hugging Face** | Trop large (tout l'AI/ML) | Focus sur les LLM + benchmarks |
| **LMSYS** | Pas de communauté, pas de gamification | Social + fun |

**Notre super-pouvoir** : On peut être **neutre, rapide, ouvert, et communautaire**. Une boîte ne peut pas être neutre sur ses propres produits.

---

## 6. Checklist "Suis-je une référence ?"

Dans 6 mois, on est une référence si :
- [ ] Quelqu'un dit "Quel est le meilleur modèle pour le code ?" → réponse : "Va voir sur AI Hub"
- [ ] Un dev utilise notre API dans son app
- [ ] Notre Twitter a 10k+ followers actifs
- [ ] On a 100+ contributeurs actifs par semaine
- [ ] Un journaliste cite AI Hub dans un article sur l'IA
- [ ] Un labo de recherche mentionne notre benchmark dans un paper
- [ ] Quelqu'un dit "J'ai découvert GPT-4o-mini sur AI Hub avant tout le monde"

---

## 7. Prochaine Action Immédiate

**Aujourd'hui** : Implémenter le **Benchmark AI Hub** (voting communautaire A vs B).
- C'est la data unique la plus rapide à créer
- Ça crée immédiatement de la valeur pour les visiteurs
- Ça donne une raison de créer un compte
- Ça génère du contenu pour Twitter/Discord

**Ensuite** : Le système de réputation + les hubs thématiques.

---

*Ce document est la boussole. Toute feature qui n'avance pas un de ces 4 piliers est du bruit.*
