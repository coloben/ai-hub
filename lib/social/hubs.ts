import {
  Code, Sparkles, MessageSquare, Globe, Image, Users, Cpu, Shield,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const HUB_IDS = [
  'general',
  'llm',
  'coding',
  'creativity',
  'reasoning',
  'french',
  'multimodal',
  'open-source',
  'safety',
] as const

export type HubId = (typeof HUB_IDS)[number]

export interface HubMeta {
  id: HubId
  label: string
  description: string
  icon: LucideIcon
  color: string
}

export const HUBS: HubMeta[] = [
  { id: 'general', label: 'Général', description: 'Actualités IA, débats et annonces.', icon: Cpu, color: 'text-accent' },
  { id: 'llm', label: 'LLM', description: 'GPT, Claude, Gemini, open models.', icon: MessageSquare, color: 'text-accent-2' },
  { id: 'coding', label: 'Code', description: 'Dev, agents, SWE-bench.', icon: Code, color: 'text-accent' },
  { id: 'creativity', label: 'Créativité', description: 'Image, vidéo, écriture.', icon: Sparkles, color: 'text-accent-2' },
  { id: 'reasoning', label: 'Raisonnement', description: 'Math, logique, o1-style.', icon: MessageSquare, color: 'text-accent' },
  { id: 'french', label: 'Français', description: 'IA en langue française.', icon: Globe, color: 'text-accent-2' },
  { id: 'multimodal', label: 'Multimodal', description: 'Vision, audio, vidéo.', icon: Image, color: 'text-accent' },
  { id: 'open-source', label: 'Open Source', description: 'Llama, Qwen, weights libres.', icon: Users, color: 'text-accent-2' },
  { id: 'safety', label: 'AI Safety', description: 'Alignement, régulation, éthique.', icon: Shield, color: 'text-warning' },
]

export function getHub(id: string): HubMeta | undefined {
  return HUBS.find((h) => h.id === id)
}

export const FLAIRS = [
  'News',
  'Release',
  'Benchmark',
  'Discussion',
  'Ask',
  'Tutorial',
  'Opinion',
] as const

export type Flair = (typeof FLAIRS)[number]

export const FLAIR_COLORS: Record<Flair, string> = {
  News: 'bg-accent-2/15 text-accent-2',
  Release: 'bg-success-dim text-success',
  Benchmark: 'bg-accent-dim text-accent',
  Discussion: 'bg-muted text-muted-foreground',
  Ask: 'bg-warning-dim text-warning',
  Tutorial: 'bg-accent-2/15 text-accent-2',
  Opinion: 'bg-destructive-dim text-destructive',
}
