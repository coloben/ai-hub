'use client'

const VOTER_KEY = 'aihub_voter_id'
const PROFILE_KEY = 'aihub_profile'

export interface LocalProfile {
  displayName: string
  handle: string
}

export function getVoterId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = localStorage.getItem(VOTER_KEY)
  if (!id) {
    id = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
    localStorage.setItem(VOTER_KEY, id)
  }
  return id
}

export function getLocalProfile(): LocalProfile {
  if (typeof window === 'undefined') {
    return { displayName: 'Visiteur', handle: 'guest' }
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw) as LocalProfile
  } catch {
    /* ignore */
  }
  return { displayName: 'Visiteur', handle: `user_${getVoterId().slice(-6)}` }
}

export function saveLocalProfile(profile: LocalProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export { fmtScore, timeAgo } from './format'
