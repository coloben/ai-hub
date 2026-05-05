import { NewsCategory } from '@/lib/types'

// ── Provider colors ──────────────────────────────────────────────────
export const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI':    'text-[#10a37f]',
  'Anthropic': 'text-[#c57f4e]',
  'Google':    'text-[#4285f4]',
  'Meta':      'text-[#0866ff]',
  'DeepSeek':  'text-[#5b73ff]',
  'Alibaba':   'text-[#ff6a00]',
  'Mistral':   'text-[#f7461c]',
  'xAI':       'text-[#a8a8a8]',
  'Zhipu AI':  'text-[#7c3aed]',
}

// ── Category config ──────────────────────────────────────────────────
export const CATEGORY_CONFIG: Record<NewsCategory, { icon: string; color: string; bg: string }> = {
  release:   { icon: '🚀', color: 'text-primary',       bg: 'bg-primary/10 border-primary/20' },
  research:  { icon: '🔬', color: 'text-info',          bg: 'bg-info-dim border-info/20' },
  benchmark: { icon: '📊', color: 'text-success',        bg: 'bg-success-dim border-success/20' },
  industry:  { icon: '🏢', color: 'text-warn',           bg: 'bg-warn-dim border-warn/20' },
  pricing:   { icon: '💰', color: 'text-success',        bg: 'bg-success-dim border-success/20' },
  security:  { icon: '🔒', color: 'text-error',          bg: 'bg-error-dim border-error/20' },
  community: { icon: '👥', color: 'text-primary',        bg: 'bg-primary-dim border-primary/20' },
}

// ── Verification config ──────────────────────────────────────────────
export const VERIFICATION_CONFIG = {
  confirmed:    { label: 'Confirmé',       icon: '✓',  color: 'text-success bg-success/10 border-success/20' },
  watch:        { label: 'À surveiller',   icon: '⚑',  color: 'text-warn bg-warn-dim border-warn/20' },
  unverified:   { label: 'À vérifier',     icon: '?',  color: 'text-text-2 bg-surface-2 border-border' },
  contradicted: { label: 'Contradiction',  icon: '⚠',  color: 'text-error bg-error-dim border-error/20' },
} as const

// ── Time formatting ──────────────────────────────────────────────────
export function timeAgo(date: string): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 2)  return 'à l\'instant'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function isNew(date: string, thresholdMin = 30): boolean {
  return (Date.now() - new Date(date).getTime()) < thresholdMin * 60 * 1000
}

export function isHot(date: string, thresholdHours = 2): boolean {
  return (Date.now() - new Date(date).getTime()) < thresholdHours * 60 * 60 * 1000
}

// ── User levels ──────────────────────────────────────────────────────
export const LEVEL_CONFIG: Record<string, { label: string; min: number; color: string; bg: string }> = {
  observateur:  { label: 'Observateur',  min: 0,    color: 'text-text-3',        bg: 'bg-surface-3' },
  contributeur: { label: 'Contributeur', min: 50,   color: 'text-primary',       bg: 'bg-primary/10' },
  analyste:     { label: 'Analyste',     min: 200,  color: 'text-success',       bg: 'bg-success/10' },
  expert:       { label: 'Expert',       min: 500,  color: 'text-warn',          bg: 'bg-warn-dim' },
  architecte:   { label: 'Architecte',   min: 1000, color: 'text-warn',          bg: 'bg-warn-dim' },
}

// ── User interests ───────────────────────────────────────────────────
export const INTERESTS = [
  { id: 'code',      label: 'Code',         icon: '⌨️' },
  { id: 'research',  label: 'Recherche',    icon: '🔬' },
  { id: 'reasoning', label: 'Raisonnement', icon: '🧠' },
  { id: 'vision',    label: 'Vision',       icon: '👁️' },
  { id: 'industry',  label: 'Industrie',    icon: '🏢' },
  { id: 'pricing',   label: 'Tarifs',       icon: '💰' },
  { id: 'audio',     label: 'Audio',        icon: '🎤' },
  { id: 'agent',     label: 'Agents',       icon: '🤖' },
] as const

// ── Avatar colors ────────────────────────────────────────────────────
export const AVATAR_COLORS = [
  ['#2563eb', '#1e40af'], ['#7c3aed', '#5b21b6'], ['#059669', '#047857'],
  ['#dc2626', '#b91c1c'], ['#d97706', '#b45309'], ['#0891b2', '#0e7490'],
] as const
