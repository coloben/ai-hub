import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { SubmitVoteInput, SubmitVoteResult, PairVoteStats } from './schema'
import { canonicalPair, winnerId } from './pair'

interface StoredVote {
  id: string
  category: string
  modelLow: string
  modelHigh: string
  winnerId: string
  voterId: string
  createdAt: string
}

interface VoteFile {
  votes: StoredVote[]
}

function dataDir(): string {
  if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
    return path.join('/tmp', 'ai-hub-data')
  }
  return path.join(process.cwd(), 'data')
}

function votesPath(): string {
  return path.join(dataDir(), 'community-votes.json')
}

const BUNDLED_VOTES = path.join(process.cwd(), 'data', 'community-votes.json')

let memoryStore: VoteFile | null = null

function parseFile(raw: string): VoteFile {
  const parsed = JSON.parse(raw) as VoteFile
  return { votes: Array.isArray(parsed.votes) ? parsed.votes : [] }
}

async function ensureFile(): Promise<VoteFile> {
  if (memoryStore) return memoryStore

  for (const p of [votesPath(), BUNDLED_VOTES]) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      memoryStore = parseFile(raw)
      return memoryStore
    } catch {
      /* next */
    }
  }

  memoryStore = { votes: [] }
  try {
    await writeFile(memoryStore)
  } catch (err) {
    console.warn('[Votes] persist skipped (read-only FS):', err)
  }
  return memoryStore
}

async function writeFile(data: VoteFile): Promise<void> {
  const dir = dataDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(votesPath(), JSON.stringify(data, null, 2), 'utf-8')
  memoryStore = data
}

function computeStats(
  category: string,
  modelAId: string,
  modelBId: string,
  votes: StoredVote[]
): PairVoteStats {
  const [low, high] = canonicalPair(modelAId, modelBId)
  const relevant = votes.filter(
    (v) => v.category === category && v.modelLow === low && v.modelHigh === high
  )
  let votesForA = 0
  let votesForB = 0
  for (const v of relevant) {
    if (v.winnerId === modelAId) votesForA++
    else if (v.winnerId === modelBId) votesForB++
  }
  const total = votesForA + votesForB
  const pctA = total > 0 ? Math.round((votesForA / total) * 100) : 50
  return { category, modelAId, modelBId, votesForA, votesForB, total, pctA }
}

export async function getPairStatsFromFile(
  category: string,
  modelAId: string,
  modelBId: string
): Promise<PairVoteStats> {
  const file = await ensureFile()
  return computeStats(category, modelAId, modelBId, file.votes)
}

export async function submitVoteToFile(input: SubmitVoteInput): Promise<SubmitVoteResult> {
  const file = await ensureFile()
  const [low, high] = canonicalPair(input.modelAId, input.modelBId)
  const picked = winnerId(input.choice, input.modelAId, input.modelBId)

  const duplicate = file.votes.some(
    (v) =>
      v.category === input.category &&
      v.modelLow === low &&
      v.modelHigh === high &&
      v.voterId === input.voterId
  )

  if (!duplicate) {
    file.votes.push({
      id: randomUUID(),
      category: input.category,
      modelLow: low,
      modelHigh: high,
      winnerId: picked,
      voterId: input.voterId,
      createdAt: new Date().toISOString(),
    })
    memoryStore = file
    try {
      await writeFile(file)
    } catch (err) {
      console.warn('[Votes] disk write failed, kept in memory:', err)
    }
  }

  const stats = computeStats(input.category, input.modelAId, input.modelBId, file.votes)
  return { ok: true, duplicate, stats }
}
