import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation de AI Hub.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-16 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Conditions générales d'utilisation</h1>

      <div className="space-y-6 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">1. Acceptation des conditions</h2>
          <p>En utilisant AI Hub, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">2. Description du service</h2>
          <p>AI Hub est une plateforme de veille sur l'intelligence artificielle permettant de suivre les actualités, benchmarks et classements des modèles IA. Les données présentées sont issues de sources publiques et peuvent ne pas être exhaustives.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">3. Compte utilisateur</h2>
          <p>Vous êtes responsable de la confidentialité de votre compte et de votre mot de passe. Vous acceptez de nous notifier immédiatement de toute utilisation non autorisée de votre compte.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">4. Contenu utilisateur</h2>
          <p>En soumettant du contenu sur AI Hub, vous accordez une licence non exclusive pour l'affichage de ce contenu sur la plateforme. Vous restez propriétaire de votre contenu. Tout contenu illégal, diffamatoire ou contraire aux règles de la communauté pourra être supprimé.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">5. Limitation de responsabilité</h2>
          <p>AI Hub est fourni "tel quel". Nous ne garantissons pas l'exactitude, l'exhaustivité ou la pertinence des informations présentées. Les benchmarks et scores affichés proviennent de sources tierces.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">6. Modifications</h2>
          <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur cette page.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/90">7. Contact</h2>
          <p>Pour toute question concernant ces conditions, vous pouvez nous contacter via le dépôt GitHub du projet.</p>
        </section>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <Link href="/" className="text-sm text-primary hover:underline">← Retour à l'accueil</Link>
      </div>
    </div>
  )
}
