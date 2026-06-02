import { ComingSoonPage } from '@/components/layout/coming-soon-page'

export const metadata = {
  title: 'Créer un compte — Bientôt | AI Hub',
  description: 'Inscription AI Hub — comptes gratuits pour voter et contribuer au classement communautaire.',
}

export default function SignupPage() {
  return (
    <ComingSoonPage
      title="Créer un compte"
      description="L’inscription permettra de voter dans les duels, sauvegarder des comparaisons et suivre des modèles. Vous pouvez déjà comparer des modèles sans compte sur la page Comparer."
    />
  )
}
