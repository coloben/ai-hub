export const LIVE_STATS_BUMP = 'aihub:live-stats-bump'

/** Tell all live scoreboard widgets to refetch immediately (after a vote, post, etc.) */
export function bumpLiveStats(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LIVE_STATS_BUMP))
}
