import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { timeAgo } from '@/lib/constants'

export default async function Home() {
  const allNews = await getLiveNews()
  const ranked = [...mockModels]
    .filter(m => m.scores.arena_elo)
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
    .slice(0, 8)
  const topModel = ranked[0]
  const newCount = mockModels.filter(m => m.is_new).length
  const posts = allNews.slice(0, 15)

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="flex gap-6">
        {/* MAIN FEED */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-primary live-pulse" />
              <span className="text-2xs font-bold uppercase tracking-widest text-primary">Live</span>
              <span className="text-2xs text-text-3">·</span>
              <span className="text-2xs text-text-3">{posts.length} signaux aujourd'hui</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text mb-1">AI Hub</h1>
            <p className="text-sm text-text-2">Le réseau social de l'intelligence artificielle — news, benchmarks, comparateur</p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <Link href="/news" className="flex-1 card p-3 text-center text-sm font-semibold text-text hover:border-primary transition-colors">📰 Feed IA</Link>
            <Link href="/leaderboard" className="flex-1 card p-3 text-center text-sm font-semibold text-text hover:border-primary transition-colors">🏆 Classement</Link>
            <Link href="/compare" className="flex-1 card p-3 text-center text-sm font-semibold text-text hover:border-primary transition-colors">⚖️ Comparer</Link>
            <Link href="/benchmarks" className="flex-1 card p-3 text-center text-sm font-semibold text-text hover:border-primary transition-colors">📊 Benchmarks</Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="card p-3 text-center">
              <p className="text-xl font-bold text-primary">{mockModels.length}</p>
              <p className="text-2xs text-text-2">modèles suivis</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xl font-bold text-success">{topModel?.scores.arena_elo ?? '—'}</p>
              <p className="text-2xs text-text-2">meilleur ELO</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xl font-bold text-info">{newCount}</p>
              <p className="text-2xs text-text-2">nouveautés</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xl font-bold text-warn">{posts.length}</p>
              <p className="text-2xs text-text-2">actus récentes</p>
            </div>
          </div>

          {/* Posts feed */}
          <div className="space-y-3">
            {posts.map((post, i) => (
              <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="post-card block group">
                <div className="flex gap-3">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-primary-dim text-text-3 hover:text-primary transition-colors" aria-label="Upvote" onClick={e => e.preventDefault()}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m5 15 7-7 7 7"/></svg>
                    </button>
                    <span className="text-xs font-bold text-text-2 tabular-nums">{post.hype_score}</span>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-error-dim text-text-3 hover:text-error transition-colors" aria-label="Downvote" onClick={e => e.preventDefault()}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/></svg>
                    </button>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {post.is_breaking && <span className="text-2xs font-bold text-error bg-error-dim px-1.5 py-0.5 rounded">BREAKING</span>}
                      <span className="text-xs font-semibold text-text-2">{post.source}</span>
                      <span className="text-text-3">·</span>
                      <span className="text-xs text-text-3">{timeAgo(post.published_at)}</span>
                    </div>
                    <h3 className="text-md font-semibold text-text leading-snug group-hover:text-primary transition-colors mb-1.5">{post.title}</h3>
                    <p className="text-sm text-text-2 line-clamp-2 mb-2">{post.summary}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-text-3 hover:text-text-2 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"/></svg>
                        {i % 5 + 1}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-3 hover:text-text-2 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
                        Partager
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-2xs text-text-3 bg-surface-2 px-1.5 py-0.5 rounded hover:bg-primary-dim hover:text-primary transition-colors">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-4">
          {/* Trending models */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-2">Top modèles</h3>
              <Link href="/leaderboard" className="text-2xs text-primary hover:underline">Tout voir</Link>
            </div>
            <div className="space-y-2">
              {ranked.slice(0, 5).map((m, i) => (
                <Link key={m.id} href={`/models/${m.id}`} className="flex items-center gap-2.5 py-1.5 -mx-1 px-1 rounded hover:bg-surface-2 transition-colors group">
                  <span className={`w-5 text-center text-xs font-bold tabular-nums ${i===0?'text-primary':i===1?'text-text-2':i===2?'text-warn':'text-text-3'}`}>{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text truncate group-hover:text-primary transition-colors">{m.name}</p>
                    <p className="text-2xs text-text-3">{m.provider}</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-text-2">{m.scores.arena_elo}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Community card */}
          <div className="card p-4 bg-gradient-to-br from-primary-dim to-surface">
            <p className="text-sm font-bold text-text mb-1">Rejoins la communauté</p>
            <p className="text-xs text-text-2 mb-3">Vote, commente et suis l'actu IA en temps réel avec des passionnés.</p>
            <Link href="/login" className="block w-full text-center rounded-lg bg-primary text-white text-sm font-semibold py-2 hover:bg-primary/90 transition-colors">
              Créer un compte
            </Link>
          </div>

          {/* Source */}
          <p className="text-2xs text-text-3 text-center">Données : LMSYS · RSS officiels · Communauté</p>
        </aside>
      </div>
    </div>
  )
}
