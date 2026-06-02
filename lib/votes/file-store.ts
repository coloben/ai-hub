import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { SubmitVoteInput, SubmitVoteResult, PairVoteStats } from './schema'
import { canonicalPair, winnerId, isChoiceForCanonicalA } from './pair'

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

const DATA_DIR = path.join(process.cwd(), 'data')
const VOTES_PATH = path.join(DATA_DIR, 'community-votes.json')

async function ensureFile(): Promise<VoteFile> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(VOTES_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as VoteFile
    if (!Array.isArray(parsed.votes)) return { votes: [] }
    return parsed
  } catch {
    return { votes: [] }
  }
}

async function writeFile(data: VoteFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(VOTES_PATH, JSON.stringify(data, null, 2), 'utf-8')
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
    await writeFile(file)
  }

  const stats = computeStats(input.category, input.modelAId, input.modelBId, file.votes)
  return { ok: true, duplicate, stats }
}
