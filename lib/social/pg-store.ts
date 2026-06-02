import { randomUUID } from 'crypto'
import { ensureSocialSchema, getPool } from './db'
import type { SocialPost, Comment, CreatePostInput } from './schema'
import { SocialPostSchema, CommentSchema, CreatePostSchema } from './schema'
import { updateScore } from './scoring'
import type { z } from 'zod'
import { CreateCommentSchema } from './schema'

type CreateCommentInput = z.infer<typeof CreateCommentSchema>

function rowToPost(row: Record<string, unknown>): SocialPost {
  return SocialPostSchema.parse({
    id: row.id,
    kind: row.kind,
    hub: row.hub,
    flair: row.flair,
    author: row.author,
    handle: row.handle,
    title: row.title,
    content: row.content,
    tags: Array.isArray(row.tags) ? row.tags : JSON.parse(String(row.tags ?? '[]')),
    upvotes: Number(row.upvotes),
    downvotes: Number(row.downvotes),
    score: Number(row.score),
    commentCount: Number(row.comment_count),
    createdAt: new Date(row.created_at as string).toISOString(),
    sourceUrl: row.source_url ?? undefined,
  })
}

export async function ensureSeedPostsPg(): Promise<void> {
  await ensureSocialSchema()
  const pool = getPool()
  const { rows } = await pool.query<{ n: string }>('SELECT COUNT(*)::text AS n FROM social_posts')
  if (parseInt(rows[0]?.n ?? '0', 10) > 0) return

  const seeds = [
    {
      hub: 'llm',
      flair: 'Discussion',
      author: 'Marie D.',
      handle: 'marie_dev',
      title: 'Claude vs Gemini pour du code production — votre retour ?',
      content: 'Je teste les deux sur une codebase React + API Node. Claude semble plus prudent sur les refactors, Gemini plus rapide sur le boilerplate.',
      tags: ['claude', 'gemini', 'coding'],
    },
    {
      hub: 'open-source',
      flair: 'Ask',
      author: 'Lucas',
      handle: 'lucas_ml',
      title: 'Quel modèle open-weight pour un RAG local en français ?',
      content: 'Budget GPU : 24 Go VRAM. Besoin de citations fiables et bon français.',
      tags: ['rag', 'français'],
    },
  ]

  for (const s of seeds) {
    await pool.query(
      `INSERT INTO social_posts (id, kind, hub, flair, author, handle, title, content, tags, upvotes, downvotes, score, comment_count)
       VALUES ($1, 'community', $2, $3, $4, $5, $6, $7, $8::jsonb, 1, 0, 1, 0)`,
      [
        randomUUID(),
        s.hub,
        s.flair,
        s.author,
        s.handle,
        s.title,
        s.content,
        JSON.stringify(s.tags),
      ]
    )
  }
}

export async function listCommunityPostsFromPg(): Promise<SocialPost[]> {
  await ensureSocialSchema()
  await ensureSeedPostsPg()
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT * FROM social_posts WHERE kind = 'community' ORDER BY created_at DESC LIMIT 200`
  )
  return rows.map(rowToPost)
}

export async function createPostInPg(input: CreatePostInput): Promise<SocialPost> {
  const parsed = CreatePostSchema.parse(input)
  await ensureSocialSchema()
  const id = randomUUID()
  const pool = getPool()
  await pool.query(
    `INSERT INTO social_posts (id, kind, hub, flair, author, handle, title, content, tags, upvotes, downvotes, score, comment_count)
     VALUES ($1, 'community', $2, $3, $4, $5, $6, $7, $8::jsonb, 1, 0, 1, 0)`,
    [
      id,
      parsed.hub,
      parsed.flair,
      parsed.author,
      parsed.handle,
      parsed.title,
      parsed.content,
      JSON.stringify(parsed.tags),
    ]
  )
  const { rows } = await pool.query('SELECT * FROM social_posts WHERE id = $1', [id])
  return rowToPost(rows[0])
}

export async function votePostInPg(
  postId: string,
  voterId: string,
  direction: 'up' | 'down',
  isCurated: boolean
): Promise<{ duplicate: boolean }> {
  await ensureSocialSchema()
  const pool = getPool()
  let duplicate = false
  try {
    await pool.query(
      `INSERT INTO social_post_votes (id, post_id, voter_id, direction)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), postId, voterId, direction]
    )
    if (!isCurated) {
      await pool.query(
        `UPDATE social_posts SET
           upvotes = upvotes + CASE WHEN $2::text = 'up' THEN 1 ELSE 0 END,
           downvotes = downvotes + CASE WHEN $2::text = 'down' THEN 1 ELSE 0 END
         WHERE id = $1`,
        [postId, direction]
      )
      await pool.query(
        `UPDATE social_posts SET score = upvotes - downvotes WHERE id = $1`,
        [postId]
      )
    }
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === '23505') duplicate = true
    else throw err
  }
  return { duplicate }
}

export async function getCuratedVotesPg(
  postId: string,
  baseUp: number,
  baseDown: number
): Promise<{ upvotes: number; downvotes: number; score: number }> {
  await ensureSocialSchema()
  const pool = getPool()
  const { rows } = await pool.query<{ direction: string }>(
    'SELECT direction FROM social_post_votes WHERE post_id = $1',
    [postId]
  )
  let up = baseUp
  let down = baseDown
  for (const r of rows) {
    if (r.direction === 'up') up++
    else down++
  }
  return { upvotes: up, downvotes: down, score: updateScore(up, down) }
}

export async function listCommentsFromPg(postId: string): Promise<Comment[]> {
  await ensureSocialSchema()
  const pool = getPool()
  const { rows } = await pool.query(
    'SELECT * FROM social_comments WHERE post_id = $1 ORDER BY created_at ASC',
    [postId]
  )
  return rows.map((row) =>
    CommentSchema.parse({
      id: row.id,
      postId: row.post_id,
      parentId: row.parent_id ?? undefined,
      author: row.author,
      handle: row.handle,
      content: row.content,
      upvotes: Number(row.upvotes),
      downvotes: Number(row.downvotes),
      score: Number(row.score),
      createdAt: new Date(row.created_at).toISOString(),
    })
  )
}

export async function addCommentInPg(
  postId: string,
  input: CreateCommentInput
): Promise<Comment | null> {
  await ensureSocialSchema()
  const pool = getPool()
  const id = randomUUID()
  const { rowCount } = await pool.query(
    `INSERT INTO social_comments (id, post_id, parent_id, author, handle, content)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, postId, input.parentId ?? null, input.author, input.handle, input.content]
  )
  if (!rowCount) return null
  await pool.query(
    'UPDATE social_posts SET comment_count = comment_count + 1 WHERE id = $1',
    [postId]
  )
  const { rows } = await pool.query('SELECT * FROM social_comments WHERE id = $1', [id])
  return CommentSchema.parse({
    id: rows[0].id,
    postId: rows[0].post_id,
    parentId: rows[0].parent_id ?? undefined,
    author: rows[0].author,
    handle: rows[0].handle,
    content: rows[0].content,
    upvotes: Number(rows[0].upvotes),
    downvotes: Number(rows[0].downvotes),
    score: Number(rows[0].score),
    createdAt: new Date(rows[0].created_at).toISOString(),
  })
}

export async function getCommunityPostPg(id: string): Promise<SocialPost | null> {
  await ensureSocialSchema()
  const pool = getPool()
  const { rows } = await pool.query('SELECT * FROM social_posts WHERE id = $1', [id])
  if (!rows[0]) return null
  return rowToPost(rows[0])
}
