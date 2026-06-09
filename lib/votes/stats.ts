import { hasDatabase } from '@/lib/db'
import { ensureVoteSchema, getPool } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

export interface CommunityStats {
  totalDuelVotes: number
  uniqueVoters: number
  votesByCategory: Record<string, number>
  persisted: boolean
}

function votesFilePaths(): string[] {
  const tmp = path.join('/tmp', 'ai-hub-data', 'community-votes.json')
  const bundled = path.join(process.cwd(), 'data', 'community-votes.json')
  const local = path.join(process.cwd(), 'data', 'community-votes.json')
  return [tmp, bundled, local]
}

async function countFromFile(): Promise<CommunityStats> {
  for (const p of votesFilePaths()) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      const data = JSON.parse(raw) as { votes?: Array<{ category: string; voterId: string }> }
      const votes = data.votes ?? []
      const byCat: Record<string, number> = {}
      const voters = new Set<string>()
      for (const v of votes) {
        byCat[v.category] = (byCat[v.category] ?? 0) + 1
        voters.add(v.voterId)
      }
      return {
        totalDuelVotes: votes.length,
        uniqueVoters: voters.size,
        votesByCategory: byCat,
        persisted: false,
      }
    } catch {
      continue
    }
  }
  return { totalDuelVotes: 0, uniqueVoters: 0, votesByCategory: {}, persisted: false }
}

async function countFromPg(): Promise<CommunityStats> {
  await ensureVoteSchema()
  const pool = getPool()
  const [agg, byCatRows] = await Promise.all([
    pool.query<{ total: string; voters: string }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(DISTINCT voter_id)::text AS voters
      FROM community_votes
    `),
    pool.query<{ category: string; n: string }>(
      'SELECT category, COUNT(*)::text AS n FROM community_votes GROUP BY category'
    ),
  ])
  const votesByCategory: Record<string, number> = {}
  for (const row of byCatRows.rows) {
    votesByCategory[row.category] = parseInt(row.n, 10)
  }
  return {
    totalDuelVotes: parseInt(agg.rows[0]?.total ?? '0', 10),
    uniqueVoters: parseInt(agg.rows[0]?.voters ?? '0', 10),
    votesByCategory,
    persisted: true,
  }
}

export async function getCommunityStats(): Promise<CommunityStats> {
  if (hasDatabase()) {
    try {
      return await countFromPg()
    } catch (err) {
      console.warn('[Stats] pg count failed:', err)
    }
  }
  return countFromFile()
}
