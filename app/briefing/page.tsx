import { generateBriefing } from '@/lib/intelligence'
import { generateAlertEvents } from '@/lib/alerts'
import { getAllRecommendations } from '@/lib/decision'
import { verifyCorpus } from '@/lib/verification'
import { getLiveNews } from '@/lib/feed'

export const revalidate = 900

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function BriefingPage() {
  const liveNews      = await getLiveNews()
  const briefing      = generateBriefing()
  const alerts        = generateAlertEvents()
  const recs          = getAllRecommendations()
  const verified      = verifyCorpus(liveNews)
  const confirmed     = verified.filter(v => v.status === 'confirmed').length
  const contradicted  = verified.filter(v => v.status === 'contradicted').length
  const criticalAlerts = alerts.filter(a => a.priority === 'critical')
  const now           = briefing.generated_at

  const heatColor = briefing.marketHeat > 75 ? 'text-down' : briefing.marketHeat > 55 ? 'text-warn' : 'text-up'
  const heatBg    = briefing.marketHeat > 75 ? 'bg-down' : briefing.marketHeat > 55 ? 'bg-warn' : 'bg-up'

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 pb-16 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="live-dot" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Briefing quotidien</span>
          <span className="text-white/15">·</span>
          <span className="text-[11px] text-white/30 font-mono">{formatDate(now)} · {formatTime(now)}</span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight">
          État du marché IA
        </h1>
        <p className="text-[13px] text-white/40 mt-1">
          Synthèse automatique · Couverture {briefing.sourceCoverage}% des sources suivies
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Market Heat',      value: briefing.marketHeat,    unit: '/100', color: heatColor },
          { label: 'Sources actives',  value: `${briefing.sourceCoverage}%`, color: 'text-data' },
          { label: 'Signaux confirmés',value: confirmed,              color: 'text-up' },
          { label: 'Alertes critiques',value: criticalAlerts.length,  color: criticalAlerts.length > 0 ? 'text-down' : 'text-white/35' },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-white/[0.08] rounded-lg p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/30 mb-1">{label}</p>
            <p className={`text-[26px] font-black font-mono leading-none tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Heat bar */}
      <div className="border border-white/[0.08] rounded-lg p-4 space-y-3">
        {[
          { label: 'Chaleur du marché',    value: briefing.marketHeat,     bar: heatBg },
          { label: 'Couverture sources',   value: briefing.sourceCoverage, bar: 'bg-data' },
          { label: 'Taux de confirmation', value: Math.round((confirmed / Math.max(verified.length, 1)) * 100), bar: 'bg-up' },
        ].map(({ label, value, bar }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/40">{label}</span>
              <span className="text-[11px] font-mono text-white/50">{value}/100</span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/[0.06]">
              <div className={`h-1 rounded-full ${bar} transition-all`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-down mb-3">Alertes critiques</h2>
          <div className="space-y-2">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="border border-down/20 bg-down/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-down animate-pulse shrink-0" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-white">{alert.title}</h3>
                    <p className="mt-1 text-[12px] text-white/45 leading-relaxed">{alert.description}</p>
                    <p className="mt-1.5 text-[11px] text-data">→ {alert.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top signaux */}
      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-3">Top signaux du jour</h2>
        <div className="space-y-2">
          {briefing.topSignals.slice(0, 5).map((signal, i) => (
            <div key={signal.news.id} className="border border-white/[0.07] rounded-lg p-4 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all">
              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-md bg-data/10 flex items-center justify-center font-mono text-[12px] font-bold text-data shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] text-white/30">{signal.news.source}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">{signal.signalType}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      signal.severity === 'critical' ? 'bg-down/10 text-down' :
                      signal.severity === 'high'     ? 'bg-warn/10 text-warn' :
                      'bg-white/[0.05] text-white/40'
                    }`}>{signal.severity}</span>
                    <span className="ml-auto font-mono text-[10px] text-data">Impact {signal.impact}/100</span>
                  </div>
                  <h3 className="text-[13px] font-semibold text-white/85">{signal.news.title}</h3>
                  <p className="mt-0.5 text-[11px] text-white/40 leading-relaxed">{signal.whyItMatters}</p>
                  <p className="mt-1 text-[11px] text-data">Action : {signal.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meilleurs modèles par usage */}
      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-3">Meilleurs modèles aujourd'hui</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recs.map(rec => (
            <div key={rec.useCase.id} className="border border-white/[0.07] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span>{rec.useCase.icon}</span>
                <span className="text-[12px] font-medium text-white/60">{rec.useCase.label}</span>
                <span className="ml-auto font-mono text-[11px] text-data">{rec.winner.finalScore}/100</span>
              </div>
              <p className="text-[14px] font-semibold text-white">{rec.winner.model.name}</p>
              <p className="text-[11px] text-white/35 mb-2">{rec.winner.model.provider}</p>
              <div className="h-[2px] w-full rounded-full bg-white/[0.06]">
                <div className="h-[2px] rounded-full bg-data" style={{ width: `${rec.winner.finalScore}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Watchlist */}
      {briefing.watchlist.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-warn mb-3">Watchlist</h2>
          <div className="border border-white/[0.07] rounded-lg p-4 space-y-2">
            {briefing.watchlist.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-warn shrink-0" />
                <span className="text-[13px] text-white/55 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contradictions */}
      {contradicted > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-down mb-3">Contradictions détectées</h2>
          <div className="space-y-2">
            {verified.filter(v => v.status === 'contradicted').map(v => (
              <div key={v.item.id} className="border border-down/15 rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-white/80">{v.item.title}</h3>
                <p className="mt-1 text-[11px] text-white/40">{v.rationale}</p>
                <p className="mt-1 text-[11px] text-down/70">Sources contradictoires : {v.contradictionSources.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gaps */}
      {briefing.gaps.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/20 mb-3">Limites de ce briefing</h2>
          <div className="border border-white/[0.05] rounded-lg p-4 space-y-1.5">
            {briefing.gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 text-white/20">·</span>
                <span className="text-[12px] text-white/30 leading-relaxed">{gap}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
