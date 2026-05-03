import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { mockModels } from '@/lib/mock-data'
import { dbGetModelHistory } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import ModelPageClient from './ModelPageClient'

export async function generateStaticParams() {
  return mockModels.map(m => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const model = mockModels.find(m => m.id === params.id)
  if (!model) return { title: 'Modèle introuvable' }
  return {
    title: `${model.name} — Scores, Benchmarks & Avis | AI Hub`,
    description: `${model.name} par ${model.provider} : Arena ELO ${model.scores.arena_elo ?? 'N/A'}, MMLU ${model.scores.mmlu ?? 'N/A'}%, HumanEval ${model.scores.humaneval ?? 'N/A'}%. Historique, prix et avis communauté.`,
    openGraph: {
      title: `${model.name} | AI Hub`,
      description: model.description ?? `Fiche complète de ${model.name}`,
    },
  }
}

export default async function ModelPage({ params }: { params: { id: string } }) {
  const model = mockModels.find(m => m.id === params.id)
  if (!model) notFound()

  const supabase = await createClient()

  // Historique ELO depuis DB
  const history = await dbGetModelHistory(model.id, 90)

  // Reviews communauté
  const { data: reviews } = await supabase
    .from('model_reviews')
    .select('*, author:profiles(username, karma, level)')
    .eq('model_id', model.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Stats moyennes des reviews
  const avgRatings = reviews && reviews.length > 0 ? {
    quality: reviews.reduce((a, r) => a + (r.rating_quality ?? 0), 0) / reviews.length,
    speed: reviews.reduce((a, r) => a + (r.rating_speed ?? 0), 0) / reviews.length,
    value: reviews.reduce((a, r) => a + (r.rating_value ?? 0), 0) / reviews.length,
  } : null

  // Modèles similaires (même provider ou même subcategory)
  const similar = mockModels
    .filter(m => m.id !== model.id && (m.provider === model.provider || m.subcategory === model.subcategory))
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
    .slice(0, 4)

  return (
    <ModelPageClient
      model={model}
      history={history}
      reviews={reviews ?? []}
      avgRatings={avgRatings}
      similar={similar}
    />
  )
}
