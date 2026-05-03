// Fact Checker - Garantie de fiabilité des informations
// Règle d'or: "Facilité d'information, facilité d'utilisation"

import { NewsItem } from './types'

export interface FactCheckResult {
  isReliable: boolean
  confidenceLevel: 'high' | 'medium' | 'low'
  issues: string[]
  recommendations: string[]
  verifiedAt: string
}

// Sources officielles avec domaines vérifiés
const TRUSTED_DOMAINS = [
  'openai.com',
  'anthropic.com',
  'ai.google',
  'blog.google',
  'ai.meta.com',
  'mistral.ai',
  'x.ai',
  'deepseek.com',
  'cohere.com',
  'ai21.com',
  'arxiv.org',
  'huggingface.co',
  'paperswithcode.com',
  'chat.lmsys.org',
  'artificialanalysis.ai',
]

// Patterns de désinformation à détecter
const SUSPICIOUS_PATTERNS = [
  /\b(fake|hoax|scam|fraud)\b/i,
  /\b(unverified|unconfirmed|rumor)\b/i,
  /\b(leaked|exclusive|breaking)\b.*\?(?!\s)/i,  // Clickbait avec ?
  /\b(shocking|amazing|incredible)\b.*!/i,  // Sensationalisme
]

// Validation d'URL
function isTrustedSource(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase()
    return TRUSTED_DOMAINS.some(trusted => domain.includes(trusted))
  } catch {
    return false
  }
}

// Détection de clickbait/sensationalisme
function detectSensationalism(text: string): string[] {
  const issues: string[] = []
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      issues.push(`Sensationalisme détecté: "${text.match(pattern)?.[0]}"`)
    }
  }
  
  // Vérifier les majuscules excessives (caps lock)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.5 && text.length > 20) {
    issues.push('Utilisation excessive de majuscules')
  }
  
  return issues
}

// Vérification de cohérence temporelle
function checkTemporalConsistency(date: string): string[] {
  const issues: string[] = []
  const itemDate = new Date(date)
  const now = new Date()
  
  // Ne pas accepter les dates futures
  if (itemDate > now) {
    issues.push('Date future détectée - possible erreur')
  }
  
  // Ne pas accepter les dates trop vieilles (> 1 an) sans flag
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  if (itemDate < oneYearAgo) {
    issues.push('Date très ancienne (> 1 an) - vérifier la source')
  }
  
  return issues
}

// Vérification de la qualité du contenu
function checkContentQuality(title: string, summary: string): string[] {
  const issues: string[] = []
  
  // Titre trop court
  if (title.length < 20) {
    issues.push('Titre très court - manque de contexte')
  }
  
  // Titre trop long (clickbait)
  if (title.length > 120) {
    issues.push('Titre très long - possible clickbait')
  }
  
  // Résumé vide ou trop court
  if (!summary || summary.length < 50) {
    issues.push('Résumé insuffisant - manque d\'informations')
  }
  
  // Résumé identique au titre (pas d'enrichissement)
  if (summary === title || summary.includes(title)) {
    issues.push('Résumé non enrichi - qualité médiocre')
  }
  
  return issues
}

// Fonction principale de fact-checking
export function factCheckNewsItem(item: NewsItem): FactCheckResult {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // 1. Vérification de la source
  const isTrusted = isTrustedSource(item.url)
  if (!isTrusted) {
    issues.push('Source non vérifiée dans notre liste de confiance')
    recommendations.push('Vérifier manuellement cette information')
  } else {
    recommendations.push('Source officielle - haute confiance')
  }
  
  // 2. Détection de sensationalisme
  const sensationalismIssues = detectSensationalism(`${item.title} ${item.summary}`)
  issues.push(...sensationalismIssues)
  
  // 3. Cohérence temporelle
  const temporalIssues = checkTemporalConsistency(item.published_at)
  issues.push(...temporalIssues)
  
  // 4. Qualité du contenu
  const qualityIssues = checkContentQuality(item.title, item.summary)
  issues.push(...qualityIssues)
  
  // 5. Vérification des tags
  if (!item.tags || item.tags.length === 0) {
    issues.push('Aucun tag - difficulté de catégorisation')
  }
  
  // Calcul du niveau de confiance
  let confidenceLevel: 'high' | 'medium' | 'low' = 'high'
  
  if (issues.length >= 3 || !isTrusted) {
    confidenceLevel = 'low'
  } else if (issues.length >= 1) {
    confidenceLevel = 'medium'
  }
  
  // Fiabilité globale
  const isReliable = isTrusted && issues.length < 2 && confidenceLevel !== 'low'
  
  return {
    isReliable,
    confidenceLevel,
    issues,
    recommendations,
    verifiedAt: new Date().toISOString(),
  }
}

// Vérification par consensus (plusieurs sources)
export function checkConsensus(items: NewsItem[], targetItem: NewsItem): {
  consensusScore: number
  confirmingSources: string[]
  contradictorySources: string[]
  isVerified: boolean
} {
  const confirmingSources: string[] = []
  const contradictorySources: string[] = []
  
  // Extraire les entités clés du titre cible
  const targetWords = targetItem.title.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  
  for (const item of items) {
    if (item.id === targetItem.id) continue
    
    const itemWords = item.title.toLowerCase()
    
    // Vérifier la similarité (même sujet)
    const commonWords = targetWords.filter(w => itemWords.includes(w))
    const similarity = commonWords.length / targetWords.length
    
    if (similarity > 0.6) {
      // Même sujet détecté - vérifier si contradictoire
      const isContradictory = 
        itemWords.includes('fake') ||
        itemWords.includes('false') ||
        itemWords.includes('not true') ||
        itemWords.includes('debunked')
      
      if (isContradictory) {
        contradictorySources.push(item.source)
      } else {
        confirmingSources.push(item.source)
      }
    }
  }
  
  // Score de consensus (0-100)
  const uniqueConfirming = new Set(confirmingSources).size
  const uniqueContradictory = new Set(contradictorySources).size
  
  let consensusScore = Math.min(100, uniqueConfirming * 25)
  consensusScore -= uniqueContradictory * 30
  consensusScore = Math.max(0, consensusScore)
  
  // Vérifié si consensus > 50 et pas de contradiction majeure
  const isVerified = consensusScore > 50 && uniqueContradictory === 0
  
  return {
    consensusScore,
    confirmingSources: Array.from(new Set(confirmingSources)),
    contradictorySources: Array.from(new Set(contradictorySources)),
    isVerified,
  }
}

// Badge de fiabilité pour l'UI
export function getReliabilityBadge(item: NewsItem): {
  text: string
  color: string
  icon: string
  tooltip: string
} {
  const check = factCheckNewsItem(item)
  
  if (check.isReliable && check.confidenceLevel === 'high') {
    return {
      text: 'Vérifié',
      color: 'bg-success/20 text-success border-success/30',
      icon: '✓',
      tooltip: 'Source fiable, contenu vérifié',
    }
  }
  
  if (check.confidenceLevel === 'medium') {
    return {
      text: 'À vérifier',
      color: 'bg-amber/20 text-amber border-amber/30',
      icon: '⚑',
      tooltip: check.issues.join(', '),
    }
  }
  
  return {
    text: 'Source non vérifiée',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: '?',
    tooltip: check.issues.slice(0, 2).join(', '),
  }
}
