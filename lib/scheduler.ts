// Intelligent Scheduler for AI-Hub
// Multi-frequency ingestion with circuit breakers, deduplication, and health monitoring

import { fetchConnectorItems, IngestedItem, SourceConnector } from './ingestion'
import { enhancedSourceConnectors as sourceConnectors, EnhancedSourceConnector } from './sources-v2'
import { dbUpsertNewsItems, dbInsertModelSnapshot, dbGetRecentNews } from './db'
import { mockModels } from './mock-data'

export type ScheduleMode = 'fast' | 'full' | 'daily'

interface SourceHealth {
  source_id: string
  last_success_at: string | null
  last_error: string | null
  consecutive_failures: number
  success_rate_24h: number
  avg_response_ms: number
  is_healthy: boolean
}

interface SchedulerMetrics {
  last_run_at: string | null
  items_ingested_total: number
  sources_healthy: number
  sources_unhealthy: number
  average_latency_ms: number
}

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 3
const CIRCUIT_BREAKER_RESET_MS = 60 * 60 * 1000 // 1 hour

// In-memory health tracking (would be Redis in production)
const _healthStore: Map<string, SourceHealth> = new Map()
const _circuitBroken: Map<string, number> = new Map() // timestamp when breaker opened
const _metrics: SchedulerMetrics = {
  last_run_at: null,
  items_ingested_total: 0,
  sources_healthy: 0,
  sources_unhealthy: 0,
  average_latency_ms: 0
}

// Priority tiers for different schedule modes
const PRIORITY_TIERS: Record<ScheduleMode, string[]> = {
  fast: ['openai-blog', 'anthropic-news', 'lmsys-arena', 'artificial-analysis'], // 15 min
  full: ['openai-blog', 'anthropic-news', 'google-ai', 'meta-ai', 'mistral-news', 'huggingface-papers', 'arxiv-ai', 'papers-with-code'],
  daily: [] // All sources including low-frequency ones
}

export function getSourceHealth(sourceId: string): SourceHealth {
  return _healthStore.get(sourceId) ?? {
    source_id: sourceId,
    last_success_at: null,
    last_error: null,
    consecutive_failures: 0,
    success_rate_24h: 100,
    avg_response_ms: 0,
    is_healthy: true
  }
}

export function getAllSourceHealth(): SourceHealth[] {
  return sourceConnectors.map(c => getSourceHealth(c.id))
}

export function getSchedulerMetrics(): SchedulerMetrics {
  return { ..._metrics }
}

function updateSourceHealth(sourceId: string, success: boolean, latencyMs: number, error?: string) {
  const existing = getSourceHealth(sourceId)
  const now = new Date().toISOString()
  
  let consecutive_failures = success ? 0 : existing.consecutive_failures + 1
  
  // Check circuit breaker
  const breakerOpened = _circuitBroken.get(sourceId)
  if (breakerOpened) {
    if (Date.now() - breakerOpened > CIRCUIT_BREAKER_RESET_MS) {
      _circuitBroken.delete(sourceId)
      consecutive_failures = success ? 0 : 1
    } else {
      // Still in circuit breaker cooldown
      return
    }
  }
  
  // Open circuit breaker if threshold reached
  if (consecutive_failures >= CIRCUIT_BREAKER_THRESHOLD) {
    _circuitBroken.set(sourceId, Date.now())
  }
  
  const newHealth: SourceHealth = {
    source_id: sourceId,
    last_success_at: success ? now : existing.last_success_at,
    last_error: success ? null : (error ?? existing.last_error),
    consecutive_failures,
    success_rate_24h: calculateSuccessRate(existing.success_rate_24h, success),
    avg_response_ms: existing.avg_response_ms > 0 
      ? Math.round((existing.avg_response_ms * 0.8) + (latencyMs * 0.2))
      : latencyMs,
    is_healthy: consecutive_failures < CIRCUIT_BREAKER_THRESHOLD
  }
  
  _healthStore.set(sourceId, newHealth)
  recalculateGlobalMetrics()
}

function calculateSuccessRate(current: number, success: boolean): number {
  // Exponential moving average with 24h window approximation
  const alpha = 0.1 // Smoothing factor
  return Math.round((success ? 100 : 0) * alpha + current * (1 - alpha))
}

function recalculateGlobalMetrics() {
  const healths = getAllSourceHealth()
  const healthy = healths.filter(h => h.is_healthy)
  const unhealthy = healths.filter(h => !h.is_healthy)
  
  _metrics.sources_healthy = healthy.length
  _metrics.sources_unhealthy = unhealthy.length
  _metrics.average_latency_ms = Math.round(
    healths.reduce((acc, h) => acc + h.avg_response_ms, 0) / healths.length
  )
}

// Deduplication using content hash
function generateContentHash(item: IngestedItem): string {
  const normalized = `${item.title.toLowerCase().trim()}|${item.summary.slice(0, 100).toLowerCase().trim()}`
  // Simple hash function
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

async function deduplicateItems(items: IngestedItem[]): Promise<IngestedItem[]> {
  const recentItems = await dbGetRecentNews(200)
  const existingHashes = new Set(recentItems.map(r => 
    generateContentHash({ ...r, connector_id: 'db', raw_url: r.url, verification_hint: 'independent' } as IngestedItem)
  ))
  
  return items.filter(item => {
    const hash = generateContentHash(item)
    if (existingHashes.has(hash)) return false
    existingHashes.add(hash)
    return true
  })
}

export async function runScheduledIngestion(mode: ScheduleMode): Promise<{
  mode: ScheduleMode
  started_at: string
  completed_at: string
  sources_processed: number
  items_ingested: number
  errors: string[]
  circuit_breakers_open: number
}> {
  const started_at = new Date().toISOString()
  const errors: string[] = []
  let items_ingested = 0
  
  // Determine which sources to process based on mode
  const priorityIds = PRIORITY_TIERS[mode]
  const connectorsToProcess = mode === 'daily' 
    ? sourceConnectors.filter(c => c.enabled)
    : sourceConnectors.filter(c => c.enabled && priorityIds.includes(c.id))
  
  // Skip circuit-broken sources
  const activeConnectors = connectorsToProcess.filter(c => {
    const breakerOpened = _circuitBroken.get(c.id)
    if (!breakerOpened) return true
    if (Date.now() - breakerOpened > CIRCUIT_BREAKER_RESET_MS) {
      _circuitBroken.delete(c.id)
      return true
    }
    return false
  })
  
  const results = await Promise.allSettled(
    activeConnectors.map(async (connector) => {
      const startTime = Date.now()
      try {
        const items = await fetchConnectorItems(connector as any, mode === 'fast' ? 3 : 6)
        const latency = Date.now() - startTime
        updateSourceHealth(connector.id, true, latency)
        return { connectorId: connector.id, items, success: true as const }
      } catch (err) {
        const latency = Date.now() - startTime
        const errorMsg = err instanceof Error ? err.message : String(err)
        updateSourceHealth(connector.id, false, latency, errorMsg)
        errors.push(`${connector.id}: ${errorMsg}`)
        return { connectorId: connector.id, items: [], success: false as const, error: errorMsg }
      }
    })
  )
  
  // Collect all items from successful fetches
  const allItems: IngestedItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      allItems.push(...result.value.items)
    }
  }
  
  // Deduplicate
  const newItems = await deduplicateItems(allItems)
  items_ingested = newItems.length
  
  // Store in database
  if (newItems.length > 0) {
    await dbUpsertNewsItems(newItems)
  }
  
  // Snapshot model history (only in full or daily mode)
  if (mode === 'full' || mode === 'daily') {
    const { snapshotModelHistory } = await import('./ingestion')
    const snapshots = snapshotModelHistory(mockModels)
    await dbInsertModelSnapshot(snapshots)
  }
  
  // Update global metrics
  _metrics.last_run_at = new Date().toISOString()
  _metrics.items_ingested_total += items_ingested
  
  const circuit_breakers_open = _circuitBroken.size
  
  return {
    mode,
    started_at,
    completed_at: new Date().toISOString(),
    sources_processed: activeConnectors.length,
    items_ingested,
    errors,
    circuit_breakers_open
  }
}

// Get status for LiveStatusBar component
export function getLiveStatus(): {
  lastSync: string | null
  syncAgoMinutes: number
  healthySources: number
  totalSources: number
  isLive: boolean
  nextSyncInMinutes: number
  circuitBreakersOpen: number
} {
  const lastSync = _metrics.last_run_at
  const syncAgoMinutes = lastSync 
    ? Math.floor((Date.now() - new Date(lastSync).getTime()) / (1000 * 60))
    : 999
  
  const healthySources = _metrics.sources_healthy
  const totalSources = sourceConnectors.filter(c => c.enabled).length
  
  return {
    lastSync,
    syncAgoMinutes,
    healthySources,
    totalSources,
    isLive: syncAgoMinutes < 20, // Live if synced in last 20 min
    nextSyncInMinutes: Math.max(0, 15 - (syncAgoMinutes % 15)), // Approximate next fast sync
    circuitBreakersOpen: _circuitBroken.size
  }
}
