interface StatCardProps {
  value: string | number
  unit: string
  label: string
  sub: string
  delta: string
  accent: string
  dot: string
  up: boolean | null
}

export function StatCard({ value, unit, label, sub, delta, accent, dot, up }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 ${accent}`}>
      <div className={`absolute right-3 top-3 h-1.5 w-1.5 rounded-full ${dot}`} />
      <p className="mb-2 text-2xs font-semibold uppercase tracking-widest text-text-3">{label}</p>
      <p className="tabular-nums text-2xl font-bold leading-none tracking-tight text-text">
        {value}<span className="ml-1 text-sm font-normal text-text-2">{unit}</span>
      </p>
      <p className="mt-1.5 text-xs text-text-2 truncate">{sub}</p>
      <p className={`mt-0.5 text-xs font-medium ${up === true ? 'text-success' : 'text-text-3'}`}>
        {up === true ? '↑ ' : ''}{delta}
      </p>
    </div>
  )
}
