import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Confidentialité | AI Hub',
  description: 'Politique de confidentialité AI Hub.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav />
      <article className="max-w-2xl mx-auto px-4 py-10 prose prose-invert prose-sm">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Confidentialité</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          AI Hub agrège des données publiques (Arena AI, Hugging Face, arXiv). Nous ne vendons pas de données
          personnelles. Lorsque les comptes seront activés, seules les informations nécessaires à l’authentification
          et aux votes seront stockées.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Pour toute question : contact via la page{' '}
          <Link href="/about" className="text-accent hover:underline">À propos</Link>.
        </p>
      </article>
      <Footer />
    </div>
  )
}
