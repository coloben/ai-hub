import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et traitement des données personnelles de AI Hub.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-16 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Politique de confidentialité</h1>

      <div className="space-y-6 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">1. Données collectées</h2>
          <p>Lors de votre inscription, nous collectons votre adresse email et les informations de profil que vous choisissez de fournir (pseudonyme, avatar, bio). Nous collectons également des données d'utilisation anonymisées pour améliorer le service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour : fournir et améliorer le service, personnaliser votre expérience (feed, alertes), communiquer avec vous sur les évolutions importantes du service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">3. Stockage et sécurité</h2>
          <p>Vos données sont stockées sur les serveurs de Supabase (infrastructure hébergée en Europe). Nous mettons en œuvre des mesures de sécurité standards pour protéger vos informations.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">4. Partage des données</h2>
          <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins commerciales. Votre profil public (pseudonyme, karma, contributions) est visible par les autres utilisateurs.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">5. Cookies</h2>
          <p>AI Hub utilise des cookies de session pour l'authentification. Ces cookies sont essentiels au fonctionnement du service et ne sont pas utilisés à des fins publicitaires.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez supprimer votre compte depuis la page Paramètres. Pour toute demande, contactez-nous via GitHub.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">7. Contact</h2>
          <p>Pour exercer vos droits ou pour toute question relative à la confidentialité, contactez-nous via le dépôt GitHub du projet.</p>
        </section>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <Link href="/" className="text-sm text-primary hover:underline">← Retour à l'accueil</Link>
      </div>
    </div>
  )
}
