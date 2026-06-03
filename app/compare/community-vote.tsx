'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Swords, Check } from 'lucide-react'
import type { PairVoteStats } from '@/lib/votes/schema'
import { getVoterId } from '@/lib/votes/voter-id'

interface Model {
  id: string
  name: string
  organization: string
  elo: number
}

export function CommunityVoteWidget({ category }: { category: string }) {
  const [models, setModels] = useState<Model[]>([])
  const [voted, setVoted] = useState<Record<string, 'A' | 'B'>>({})
  const [statsByPair, setStatsByPair] = useState<Record<string, PairVoteStats>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/models')
      .then((r) => r.json())
      .then((d) => {
        const data: Model[] = d.data ?? []
        setModels(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pairs: [Model, Model][] = []
  for (let i = 0; i < models.length - 1; i += 2) {
    pairs.push([models[i], models[i + 1]])
  }
  if (pairs.length === 0 && models.length >= 2) {
    pairs.push([models[0], models[1]])
  }

  const currentPair = pairs[currentIndex % Math.max(pairs.length, 1)]
  const modelA = currentPair?.[0]
  const modelB = currentPair?.[1]
  const voteKey = modelA && modelB ? `${modelA.id}-${modelB.id}` : ''
  const hasVoted = voteKey ? voted[voteKey] : undefined
  const stats = voteKey ? statsByPair[voteKey] : undefined

  const fetchStats = useCallback(async (a: Model, b: Model) => {
    const params = new URLSearchParams({
      category,
      modelAId: a.id,
      modelBId: b.id,
    })
    const res = await fetch(`/api/v1/votes?${params}`)
    const json = await res.json()
    if (json.ok && json.stats) {
      const key = `${a.id}-${b.id}`
      setStatsByPair((prev) => ({ ...prev, [key]: json.stats as PairVoteStats }))
    }
  }, [category])

  useEffect(() => {
    if (modelA && modelB) {
      fetchStats(modelA, modelB)
    }
  }, [modelA, modelB, fetchStats])

  const handleVote = async (choice: 'A' | 'B') => {
    if (!modelA || !modelB || hasVoted || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          modelAId: modelA.id,
          modelBId: modelB.id,
          choice,
          voterId: getVoterId(),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        const msg = json.error ?? 'Impossible d’enregistrer le vote'
        setError(msg === 'Failed to save vote' ? 'Enregistrement impossible — réessayez dans un instant.' : msg)
        return
      }
      setVoted((prev) => ({ ...prev, [voteKey]: choice }))
      if (json.stats) {
        setStatsByPair((prev) => ({ ...prev, [voteKey]: json.stats as PairVoteStats }))
      }
      if (json.duplicate) {
        setError('Vous avez déjà voté pour cette paire.')
      }
    } catch {
      setError('Erreur réseau — réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  const nextPair = () => {
    setError(null)
    setCurrentIndex((i) => (i + 1) % pairs.length)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
        <Card className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
      </div>
    )
  }

  if (models.length < 2 || !modelA || !modelB) {
    return <p className="text-sm text-muted-foreground">Pas assez de modèles pour comparer.</p>
  }

  const pctA = stats?.pctA ?? 50
  const totalVotes = stats?.total ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Swords size={14} className="text-accent" />
        <h2 className="text-[13px] font-semibold text-foreground">Comparer deux modèles</h2>
        <Badge variant="secondary" className="text-[10px]">{category}</Badge>
        {totalVotes > 0 && (
          <span className="text-[10px] text-muted-foreground ml-auto">{totalVotes} votes communauté</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`relative overflow-hidden transition-all duration-200 card-lift ${
            hasVoted
              ? 'cursor-default'
              : 'cursor-pointer hover:border-accent/20'
          } ${hasVoted === 'A' ? 'border-accent/40' : 'border-border'}`}
          onClick={() => !hasVoted && !submitting && handleVote('A')}
        >
          <CardContent className="p-5 text-center">
            {hasVoted === 'A' && (
              <div className="absolute top-2.5 right-2.5">
                <Check size={16} className="text-accent" />
              </div>
            )}
            <p className="text-base font-bold text-foreground">{modelA.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{modelA.organization}</p>
            <p className="text-[10px] text-muted-foreground mt-1">ELO {modelA.elo}</p>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden transition-all duration-200 card-lift ${
            hasVoted
              ? 'cursor-default'
              : 'cursor-pointer hover:border-accent/20'
          } ${hasVoted === 'B' ? 'border-accent/40' : 'border-border'}`}
          onClick={() => !hasVoted && !submitting && handleVote('B')}
        >
          <CardContent className="p-5 text-center">
            {hasVoted === 'B' && (
              <div className="absolute top-2.5 right-2.5">
                <Check size={16} className="text-accent" />
              </div>
            )}
            <p className="text-base font-bold text-foreground">{modelB.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{modelB.organization}</p>
            <p className="text-[10px] text-muted-foreground mt-1">ELO {modelB.elo}</p>
          </CardContent>
        </Card>
      </div>

      {(hasVoted || totalVotes > 0) && (
        <div className="space-y-1.5 animate-slide-up">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{modelA.name} ({stats?.votesForA ?? 0})</span>
            <span>{modelB.name} ({stats?.votesForB ?? 0})</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent/60 rounded-full transition-all duration-300"
              style={{ width: `${pctA}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-center">
            {totalVotes === 0
              ? 'Soyez le premier à voter pour cette paire.'
              : `${pctA} % préfèrent ${modelA.name} · ${totalVotes} vote${totalVotes > 1 ? 's' : ''}`}
          </p>
          {hasVoted && pairs.length > 1 && (
            <div className="flex justify-center pt-1">
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-md" onClick={nextPair}>
                Comparaison suivante →
              </Button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-destructive text-center">{error}</p>}

      {!hasVoted && (
        <p className="text-[11px] text-muted-foreground text-center">
          {submitting ? 'Enregistrement…' : 'Cliquez sur un modèle pour voter. Un vote par paire et par navigateur.'}
        </p>
      )}
    </div>
  )
}
