import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-[96px] font-bold leading-none tracking-tighter text-white/[0.06]">404</h1>
        <p className="mb-2 text-lg font-semibold text-white/90">Page introuvable</p>
        <p className="mb-8 text-sm text-white/40">Cette page n'existe pas ou a été déplacée.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          Retour au Dashboard
        </Link>
      </div>
    </div>
  )
}
