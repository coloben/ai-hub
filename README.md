# AI Intelligence Hub

Dense intelligence feed for AI researchers and developers. A Bloomberg Terminal-style dashboard for tracking AI models, benchmarks, and research.

## Features

- **Ticker Tape**: Breaking news ticker with auto-scroll and pause on hover
- **News Feed**: Filterable intelligence feed from major AI sources
- **Model Leaderboard**: Sortable table with all major benchmarks
- **Benchmarks Visualization**: Radar charts, bar charts, and timeline views
- **Release Timeline**: Chronological view of model releases
- **Global Search**: ⌘K command palette for quick navigation

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

## Data Sources

- HuggingFace Papers
- ArXiv cs.AI / cs.LG
- Open LLM Leaderboard
- The Verge AI
- VentureBeat AI
- MIT Tech Review
- Anthropic Blog
- OpenAI Blog

## License

MIT
