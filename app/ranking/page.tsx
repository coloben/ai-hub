import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, ChevronUp, ChevronDown, MessageSquare, Code, Bot, Eye } from 'lucide-react'
import Link from 'next/link'
import { OrganizationSchema, BreadcrumbSchema } from '@/app/components/json-ld'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { CommunityScoreboard } from '@/components/live/community-scoreboard'
import { ArenaLeaderboardTable } from '@/components/arena/arena-leaderboard-table'
import { getArenaBoards } from '@/lib/data/pipeline'
import { rankingFromData } from '@/lib/trust'
import { DataTrustBanner } from '@/components/trust/data-trust-banner'
import { ARENA_BOARD_CONFIG } from '@/lib/data/sources'
import type { ArenaBoard } from '@/lib/data/schema'

export const metadata = {
  title: 'Classement IA — Leaderboard Arena AI & Benchmarks | AI Hub',
  description:
    'Classement Arena AI par catégorie : Text, Code, Agent, Vision. ELO certifiés et variations jour/jour.',
}

const BOARD_ICONS: Record<string, typeof Trophy> = {
  text: MessageSquare,
  code: Code,
  agent: Bot,
  vision: Eye,
}

function HeroRanking() {
  return (
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={14} className="text-accent" />
          <span className="text-[11px] font-medium text-accent tracking-wide">
            Miroir Arena AI (LMSYS)
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
          Classements Arena par discipline
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
          Text, Code/WebDev, Agent et Vision — comme sur lmarena.ai. Noms lisibles, intervalles de confiance,
          variations vs le snapshot précédent disponible.
        </p>
      </div>
    </section>
  )
}

function BoardTabs({ boards, active }: { boards: ArenaBoard[]; active: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
      {boards.map((board) => {
        const Icon = BOARD_ICONS[board.id] ?? Trophy
        const isActive = board.id === active
        return (
          <Link
            key={board.id}
            href={`/ranking?board=${board.id}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-accent bg-accent-dim'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={13} />
            {board.label}
          </Link>
        )
      })}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>
}) {
  const params = await searchParams
  const arena = await getArenaBoards()
  const boardIds = arena.boards.map((b) => b.id)
  const activeBoardId = params.board && boardIds.includes(params.board) ? params.board : arena.defaultBoard
  const boardMeta = arena.boards.find((b) => b.id === activeBoardId) ?? ARENA_BOARD_CONFIG[0]
  const ranking = arena.rankings[activeBoardId] ?? arena.rankings.text
  const trust = rankingFromData(ranking)

  const movers = [...ranking.models]
    .filter((m) => m.eloDelta !== 0)
    .sort((a, b) => Math.abs(b.eloDelta) - Math.abs(a.eloDelta))
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background grid-dots">
      <OrganizationSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://ai-hub-cnb3.vercel.app/' },
          { name: 'Classement', url: 'https://ai-hub-cnb3.vercel.app/ranking' },
        ]}
      />

      <TopNav active="Classement" />
      <HeroRanking />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <BoardTabs boards={arena.boards} active={activeBoardId} />

        {boardMeta.description && (
          <p className="text-[12px] text-muted-foreground mt-2">{boardMeta.description}</p>
        )}

        <div className="mt-3">
          <DataTrustBanner status={trust} />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
                <Trophy size={13} className="text-accent" />
                {boardMeta.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ArenaLeaderboardTable
                models={ranking.models}
                scoreKind={boardMeta.scoreKind}
                boardLabel={boardMeta.label}
                source={ranking.source}
                updatedAt={ranking.updatedAt}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-accent-2" />
                  Variations snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {movers.length > 0 ? (
                  movers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-1 gap-2">
                      <span className="text-[13px] text-foreground truncate">{m.name}</span>
                      <div
                        className={`flex items-center gap-0.5 text-[10px] font-mono shrink-0 tabular-nums ${
                          m.eloDelta > 0 ? 'text-green-400' : 'text-destructive'
                        }`}
                      >
                        {m.eloDelta > 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        {boardMeta.scoreKind === 'relative'
                          ? `${m.eloDelta > 0 ? '+' : ''}${(m.eloDelta / 100).toFixed(1)}%`
                          : `${m.eloDelta > 0 ? '+' : ''}${m.eloDelta}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground py-2">
                    Pas de variation entre les deux derniers snapshots Arena pour cette catégorie.
                  </p>
                )}
                <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/40">
                  Snapshot {arena.snapshotDate} vs précédent disponible
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold">Votes communauté AI Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityScoreboard category="global" limit={8} compact />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold">Autres classements Arena</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {arena.boards
                  .filter((b) => b.id !== activeBoardId)
                  .map((b) => (
                    <Link
                      key={b.id}
                      href={`/ranking?board=${b.id}`}
                      className="block text-[12px] text-muted-foreground hover:text-accent py-1"
                    >
                      {b.label} →
                    </Link>
                  ))}
                {boardMeta.sourceUrl && (
                  <a
                    href={boardMeta.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11px] text-accent hover:underline pt-2"
                  >
                    Vérifier sur arena.ai →
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
