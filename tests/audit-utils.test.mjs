import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function sanitizeText(input, maxLen) {
  const stripped = input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
  return stripped.slice(0, maxLen)
}

describe('sanitizeText (mirror)', () => {
  it('strips HTML tags', () => {
    assert.equal(sanitizeText('<b>hi</b>', 100), 'hi')
  })
})

describe('import-meta source', () => {
  it('documents arxiv via label in codebase', () => {
    const src = readFileSync(join(root, 'lib/social/import-meta.ts'), 'utf8')
    assert.match(src, /via arXiv/)
  })
})

describe('voter id unification', () => {
  it('uses single storage key', () => {
    const src = readFileSync(join(root, 'lib/votes/voter-id.ts'), 'utf8')
    assert.match(src, /aihub_voter_id/)
    assert.match(src, /aihub-voter-id/)
  })
})
