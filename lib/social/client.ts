'use client'

import { getVoterId as getSharedVoterId } from '@/lib/votes/voter-id'

const PROFILE_KEY = 'aihub_profile'

export interface LocalProfile {
  displayName: string
  handle: string
}

export function getVoterId(): string {
  return getSharedVoterId()
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
