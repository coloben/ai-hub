import Link from 'next/link'
import { Zap } from 'lucide-react'
import { DeployVersion } from './deploy-version'

export function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap size={10} className="text-accent" />
            </div>
            <span className="text-xs font-semibold text-foreground">AI Hub</span>
            <span className="text-[10px] text-muted-foreground">— Le média de référence de l&apos;IA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Méthodologie
            </Link>
            <Link href="/docs/api" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              API
            </Link>
            <Link href="/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Conditions
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground/50">
            Sources : LMSYS Arena · Hugging Face · arXiv — Dernière MAJ :{' '}
            {new Date().toLocaleDateString('fr-FR')}
            <DeployVersion />
          </p>
        </div>
      </div>
    </footer>
  )
}
