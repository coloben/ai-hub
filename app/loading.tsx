'use client'

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-white/40 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">Chargement</span>
      </div>
    </div>
  )
}
