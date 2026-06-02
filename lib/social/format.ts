export function fmtScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - Date.parse(iso)
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${Math.max(1, mins)} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
