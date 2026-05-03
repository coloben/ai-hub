# AI Intelligence Hub 🌐

**World-Class AI Intelligence Platform** — Centre de contrôle mondial pour les actualités IA, benchmarks, modèles et signaux faibles en temps réel.

## ✨ Features World-Class

### 🔄 Live Intelligence System
- **Multi-Frequency Ingestion**: Polling intelligent toutes les 15min/1h/24h
- **15+ Verified Sources**: OpenAI, Anthropic, Google, Meta, Mistral, LMSYS, ArXiv, HuggingFace...
- **Circuit Breaker**: Auto-recovery après 3 erreurs consécutives
- **Deduplication**: Hash sémantique, fenêtre 48h
- **Live Status Bar**: Sync temps réel visible partout

### 🧠 Intelligence Engine
- **Scoring**: Confidence, Impact, Severity automatiques
- **Vérification**: Badges Confirmé/À surveiller/À vérifier/Contradiction
- **Enrichment**: Extraction d'entités, sentiment analysis
- **Cross-Reference**: Validation multi-sources

### 🎨 UI/UX Premium
- **SignalCard**: Cartes intelligentes avec badges contextuels
- **Live Feed Page**: Fil temps réel avec filtres dynamiques
- **Dark Mode Pro**: Design Bloomberg-terminal optimisé
- **Animations**: Transitions fluides, micro-interactions
- **Command Palette**: ⌘K navigation rapide

### 📊 Dashboards
- **Command Center**: Vue d'ensemble stratégique
- **Live Feed**: Signaux temps réel
- **Briefing**: Rapport quotidien auto-généré
- **Leaderboard**: Classements ELO et benchmarks
- **Compare**: Decision Engine (6 cas d'usage)
- **Alerts**: Alertes configurables

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Zod (validation)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app/
├── page.tsx                 # Dashboard
├── news/page.tsx           # News feed
├── leaderboard/page.tsx    # Model rankings
├── benchmarks/page.tsx     # Visual comparisons
├── timeline/page.tsx       # Release history
├── api/
│   ├── feed/route.ts       # News aggregation
│   ├── models/route.ts     # Model data
│   ├── benchmarks/route.ts # Benchmark matrix
│   ├── search/route.ts     # Full-text search
│   └── cron/route.ts       # Data refresh
components/
├── TickerTape.tsx          # Breaking news ticker
├── Sidebar.tsx             # Navigation
├── CommandPalette.tsx      # ⌘K search
├── NewsCard.tsx            # News item component
├── NewsGrid.tsx            # News grid layout
├── TopModelsSidebar.tsx    # Top models widget
└── ModelLeaderboardStrip.tsx
lib/
├── types.ts                # TypeScript definitions
└── mock-data.ts            # Development data
```

## 📡 Data Sources (15+)

### Tier 1 - Critical (15min polling)
- OpenAI Blog/API
- Anthropic News
- Google AI Blog
- Meta AI
- LMSYS Chatbot Arena
- Mistral AI

### Tier 2 - High (30min polling)
- Artificial Analysis
- OpenRouter
- HuggingFace Papers

### Tier 3 - Research (1-2h polling)
- ArXiv cs.AI / cs.LG
- Papers With Code
- DeepSeek AI

### Tier 4 - Community (4h polling)
- Cohere
- AI21 Labs
- HuggingFace Security

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 14 + TypeScript + Tailwind CSS                     │
├─────────────────────────────────────────────────────────────┤
│  API Routes: /api/cron?mode={fast|full|daily}              │
│  Scheduler: Circuit breaker, deduplication, health checks    │
├─────────────────────────────────────────────────────────────┤
│  Storage: Memory (dev) / PostgreSQL / Supabase (prod)       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment

```bash
# Install
npm install

# Environment
cp .env.local.example .env.local
# Edit: CRON_SECRET, DATABASE_URL (optional)

# Dev
npm run dev

# Build & Deploy (Vercel)
npm run build
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes | Auth token for /api/cron |
| `DATABASE_URL` | No | PostgreSQL/Neon (default: memory) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | No | Supabase service role key |

## 📝 License

MIT © AI Intelligence Hub
