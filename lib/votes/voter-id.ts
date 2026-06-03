/** Single browser voter id for duels + social votes */
export const VOTER_STORAGE_KEY = 'aihub_voter_id'
const LEGACY_KEYS = ['aihub-voter-id', 'aihub_voter_id'] as const

export function getVoterId(): string {
  if (typeof window === 'undefined') return 'ssr'
  for (const legacy of LEGACY_KEYS) {
    const old = localStorage.getItem(legacy)
    if (old && legacy !== VOTER_STORAGE_KEY) {
      localStorage.setItem(VOTER_STORAGE_KEY, old)
      localStorage.removeItem(legacy)
      return old
    }
  }
  let id = localStorage.getItem(VOTER_STORAGE_KEY)
  if (!id) {
    id = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
    localStorage.setItem(VOTER_STORAGE_KEY, id)
  }
  return id
}
