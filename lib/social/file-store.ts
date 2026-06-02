import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { SocialPost, Comment, CreatePostInput } from './schema'
import { SocialPostSchema, CommentSchema, CreatePostSchema, CreateCommentSchema } from './schema'
import type { z } from 'zod'
import { updateScore } from './scoring'

type CreateCommentInput = z.infer<typeof CreateCommentSchema>

interface PostVote {
  postId: string
  voterId: string
  direction: 'up' | 'down'
}

interface SocialFile {
  posts: SocialPost[]
  comments: Comment[]
  votes: PostVote[]
}

/** Vercel FS is read-only except /tmp — use /tmp when deployed serverless */
function dataDir(): string {
  if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
    return path.join('/tmp', 'ai-hub-data')
  }
  return path.join(process.cwd(), 'data')
}

function socialPath(): string {
  return path.join(dataDir(), 'social.json')
}

/** Bundled seed path (read-only, always available on Vercel) */
const BUNDLED_SOCIAL = path.join(process.cwd(), 'data', 'social.json')

let memoryStore: SocialFile | null = null

const SEED_POSTS: Omit<SocialPost, 'id' | 'createdAt'>[] = [
  {
    kind: 'community',
    hub: 'llm',
    flair: 'Discussion',
    author: 'Marie D.',
    handle: 'marie_dev',
    title: 'Claude vs Gemini pour du code production — votre retour ?',
    content: 'Je teste les deux sur une codebase React + API Node. Claude semble plus prudent sur les refactors, Gemini plus rapide sur le boilerplate. Vous tranchez comment ?',
    tags: ['claude', 'gemini', 'coding'],
    upvotes: 42,
    downvotes: 3,
    score: 39,
    commentCount: 12,
  },
  {
    kind: 'community',
    hub: 'open-source',
    flair: 'Ask',
    author: 'Lucas',
    handle: 'lucas_ml',
    title: 'Quel modèle open-weight pour un RAG local en français ?',
    content: 'Budget GPU : 24 Go VRAM. Besoin de citations fiables et bon français. Qwen vs Llama vs Mistral en 2026 ?',
    tags: ['rag', 'français', 'open-source'],
    upvotes: 28,
    downvotes: 1,
    score: 27,
    commentCount: 8,
  },
  {
    kind: 'community',
    hub: 'safety',
    flair: 'Opinion',
    author: 'Amina K.',
    handle: 'amina_policy',
    title: 'Les benchmarks Arena ne mesurent pas l\'alignement',
    content: 'Un modèle peut être #1 en ELO tout en étant dangereux sur des jailbreaks ciblés. Il faudrait un score "safety" public à côté de l\'ELO.',
    tags: ['safety', 'arena', 'benchmark'],
    upvotes: 67,
    downvotes: 5,
    score: 62,
    commentCount: 24,
  },
]

function buildSeedData(): SocialFile {
  const posts = SEED_POSTS.map((p, i) =>
    SocialPostSchema.parse({
      ...p,
      id: `seed-${i + 1}`,
      createdAt: new Date(Date.now() - (i + 1) * 3_600_000 * 4).toISOString(),
    })
  )
  return { posts, comments: [], votes: [] }
}

function parseFile(raw: string): SocialFile {
  const parsed = JSON.parse(raw) as SocialFile
  return {
    posts: Array.isArray(parsed.posts) ? parsed.posts : [],
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    votes: Array.isArray(parsed.votes) ? parsed.votes : [],
  }
}

async function ensureFile(): Promise<SocialFile> {
  if (memoryStore) return memoryStore

  const paths = [socialPath(), BUNDLED_SOCIAL]
  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      memoryStore = parseFile(raw)
      return memoryStore
    } catch {
      /* try next */
    }
  }

  memoryStore = buildSeedData()
  try {
    await writeFile(memoryStore)
  } catch (err) {
    console.warn('[Social] file write skipped (read-only FS):', err)
  }
  return memoryStore
}

async function writeFile(data: SocialFile): Promise<void> {
  const dir = dataDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(socialPath(), JSON.stringify(data, null, 2), 'utf-8')
  memoryStore = data
}

export async function listCommunityPostsFromFile(): Promise<SocialPost[]> {
  const file = await ensureFile()
  return file.posts
}

export async function getPostFromFile(id: string): Promise<SocialPost | null> {
  const file = await ensureFile()
  return file.posts.find((p) => p.id === id) ?? null
}

export async function createPostInFile(input: CreatePostInput): Promise<SocialPost> {
  const parsed = CreatePostSchema.parse(input)
  const file = await ensureFile()
  const post = SocialPostSchema.parse({
    id: randomUUID(),
    kind: 'community',
    hub: parsed.hub,
    flair: parsed.flair,
    author: parsed.author,
    handle: parsed.handle,
    title: parsed.title,
    content: parsed.content,
    tags: parsed.tags,
    upvotes: 1,
    downvotes: 0,
    score: 1,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  })
  file.posts.unshift(post)
  await writeFile(file)
  return post
}

export async function votePostInFile(
  postId: string,
  voterId: string,
  direction: 'up' | 'down'
): Promise<{ post: SocialPost | null; duplicate: boolean }> {
  const file = await ensureFile()
  const post = file.posts.find((p) => p.id === postId)
  if (!post) return { post: null, duplicate: false }

  const exists = file.votes.some((v) => v.postId === postId && v.voterId === voterId)
  if (!exists) {
    file.votes.push({ postId, voterId, direction })
    if (post.kind === 'community') {
      if (direction === 'up') post.upvotes++
      else post.downvotes++
      post.score = updateScore(post.upvotes, post.downvotes)
    }
    await writeFile(file)
  }

  return { post, duplicate: exists }
}

export async function listCommentsFromFile(postId: string): Promise<Comment[]> {
  const file = await ensureFile()
  return file.comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
}

export async function addCommentInFile(
  postId: string,
  input: CreateCommentInput
): Promise<Comment | null> {
  const file = await ensureFile()
  const post = file.posts.find((p) => p.id === postId)
  if (!post) return null

  const comment = CommentSchema.parse({
    id: randomUUID(),
    postId,
    parentId: input.parentId,
    author: input.author,
    handle: input.handle,
    content: input.content,
    upvotes: 1,
    downvotes: 0,
    score: 1,
    createdAt: new Date().toISOString(),
  })
  file.comments.push(comment)
  post.commentCount++
  await writeFile(file)
  return comment
}

export async function getCuratedVoteDelta(
  postId: string,
  baseUp: number,
  baseDown: number
): Promise<{ upvotes: number; downvotes: number; score: number }> {
  const file = await ensureFile()
  const votes = file.votes.filter((v) => v.postId === postId)
  let up = baseUp
  let down = baseDown
  for (const v of votes) {
    if (v.direction === 'up') up++
    else down++
  }
  return { upvotes: up, downvotes: down, score: updateScore(up, down) }
}

export async function voteCuratedInFile(
  postId: string,
  voterId: string,
  direction: 'up' | 'down'
): Promise<{ duplicate: boolean }> {
  const file = await ensureFile()
  const exists = file.votes.some((v) => v.postId === postId && v.voterId === voterId)
  if (!exists) {
    file.votes.push({ postId, voterId, direction })
    await writeFile(file)
  }
  return { duplicate: exists }
}
