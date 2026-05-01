'use client'

import { generateBriefing } from '@/lib/intelligence'
import { generateAlertEvents } from '@/lib/alerts'
import { getAllRecommendations } from '@/lib/decision'
import { verifyCorpus } from '@/lib/verification'
import { mockNews } from '@/lib/mock-data'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function HeatBar({ value, label, color = 'bg-primary' }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-2xs text-text-faint">{label}</span>
        <span className="font-mono text-2xs text-text-muted">{value}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

export default function BriefingPage() {
  const briefing      = generateBriefing()
  const alerts        = generateAlertEvents()
  const recs          = getAllRecommendations()
  const verified      = verifyCorpus(mockNews)
  const confirmed     = verified.filter(v => v.status === 'confirmed').length
  const contradicted  = verified.filter(v => v.status === 'contradicted').length
  const criticalAlerts = alerts.filter(a => a.priority === 'critical')
  const now           = briefing.generated_at

  return (
    <div className="relative flex overflow-hidden">
      <span className="mesh-orb right-[4%] top-[4%] h-64 w-64 bg-primary/20"></span>
      <span className="mesh-orb left-[35%] top-[25%] h-56 w-56 bg-cyan-500/10"></span>
      <div className="flex-1 px-6 py-6 2xl:px-8">
        <div className="mx-auto max-w-5xl space-y-8">

          {/* Header */}
          <div className="intel-card rounded-[28px] p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="signal-ring rounded-full bg-white/[0.04] px-3 py-1 text-2xs font-mono uppercase tracking-[0.24em] text-primary">Briefing IA quotidien</span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-2xs font-mono text-text-muted">{formatDate(now)}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-2xs font-mono text-text-faint">Généré à {formatTime(now)}</span>
            </div>
            <h1 className="text-[36px] font-semibold tracking-[-0.05em] leading-[1.05] md:text-[48px]">
              État du marché IA — aujourd&apos;hui
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Synthèse automatique des signaux, benchmarks, alertes et recommandations de la journée.
              Score de confiance calculé sur {briefing.sourceCoverage}% des sources suivies.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Market Heat',    value: briefing.marketHeat,    color: briefing.marketHeat > 75 ? 'text-red-400' : briefing.marketHeat > 55 ? 'text-amber' : 'text-success' },
                { label: 'Sources actives', value: `${briefing.sourceCoverage}%`, color: 'text-primary' },
                { label: 'Signaux confirmés', value: confirmed,            color: 'text-success' },
                { label: 'Alertes critiques', value: criticalAlerts.length, color: criticalAlerts.length > 0 ? 'text-red-400' : 'text-text-faint' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-2xs uppercase tracking-[0.2em] text-text-faint">{label}</div>
                  <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <HeatBar value={briefing.marketHeat}     label="Chaleur du marché"  color={briefing.marketHeat > 75 ? 'bg-red-400' : 'bg-amber'} />
              <HeatBar value={briefing.sourceCoverage} label="Couverture sources" color="bg-primary" />
              <HeatBar value={Math.round((confirmed / Math.max(verified.length, 1)) * 100)} label="Taux de confirmation" color="bg-success" />
            </div>
          </div>

          {/* Alertes critiques */}
          {criticalAlerts.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-red-400">Alertes critiques</h2>
              <div className="space-y-3">
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className="intel-card rounded-2xl border-l-2 border-red-500 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-red-400"></span>
                      <div>
                        <h3 className="text-sm font-semibold">{alert.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-text-muted">{alert.description}</p>
                        <p className="mt-1 text-2xs text-primary">→ {alert.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top signaux */}
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-text-muted">Top signaux du jour</h2>
            <div className="space-y-3">
              {briefing.topSignals.slice(0, 5).map((signal, i) => (
                <div key={signal.news.id} className="intel-card rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-2xs text-text-faint">{signal.news.source}</span>
                        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-2xs text-text-muted">{signal.signalType}</span>
                        <span className={`rounded-full px-2 py-0.5 text-2xs ${signal.severity === 'critical' ? 'bg-red-500/10 text-red-400' : signal.severity === 'high' ? 'bg-amber/10 text-amber' : 'bg-white/[0.05] text-text-muted'}`}>
                          {signal.severity}
                        </span>
                        <span className="ml-auto font-mono text-2xs text-primary">Impact {signal.impact}/100</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-5">{signal.news.title}</h3>
                      <p className="mt-1 text-2xs leading-5 text-text-muted">{signal.whyItMatters}</p>
                      <p className="mt-1 text-2xs text-primary">Action : {signal.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommandations par cas d'usage */}
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-text-muted">Meilleurs modèles aujourd&apos;hui</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recs.map(rec => (
                <div key={rec.useCase.id} className="intel-card rounded-2xl p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{rec.useCase.icon}</span>
                      <span className="text-xs font-medium">{rec.useCase.label}</span>
                    </div>
                    <span className="font-mono text-xs text-primary">{rec.winner.finalScore}/100</span>
                  </div>
                  <div className="text-sm font-semibold">{rec.winner.model.name}</div>
                  <div className="text-2xs text-text-faint">{rec.winner.model.provider}</div>
                  <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06]">
                    <div className="h-1 rounded-full bg-primary" style={{ width: `${rec.winner.finalScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Watchlist */}
          {briefing.watchlist.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-amber">Watchlist — Signaux à surveiller</h2>
              <div className="intel-card rounded-[24px] p-5">
                <ul className="space-y-2">
                  {briefing.watchlist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                      <span className="text-sm leading-5 text-text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Contradictions */}
          {contradicted > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-red-400">Contradictions détectées</h2>
              <div className="space-y-3">
                {verified.filter(v => v.status === 'contradicted').map(v => (
                  <div key={v.item.id} className="intel-card rounded-2xl border-l-2 border-red-500/50 p-4">
                    <h3 className="text-sm font-semibold">{v.item.title}</h3>
                    <p className="mt-1 text-2xs text-text-muted">{v.rationale}</p>
                    <p className="mt-1 text-2xs text-red-400">Sources contradictoires : {v.contradictionSources.join(', ')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gaps */}
          {briefing.gaps.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-text-faint">Limites de ce briefing</h2>
              <div className="intel-card rounded-2xl p-4">
                <ul className="space-y-1">
                  {briefing.gaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-text-faint">·</span>
                      <span className="text-xs leading-5 text-text-faint">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
