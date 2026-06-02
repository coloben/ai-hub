import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Conditions d’utilisation | AI Hub',
  description: 'Conditions d’utilisation du site AI Hub.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav />
      <article className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Conditions d&apos;utilisation</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          AI Hub est fourni à titre informatif. Les classements proviennent de sources tierces ; nous nous efforçons
          de les actualiser mais ne garantissons pas l’exactitude en temps réel. Les exports open-data sont sous
          licence Creative Commons BY 4.0 lorsque indiqué sur la page API.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Voir aussi la <Link href="/privacy" className="text-accent hover:underline">politique de confidentialité</Link>.
        </p>
      </article>
      <Footer />
    </div>
  )
}
