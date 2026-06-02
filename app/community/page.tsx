import { ComingSoonPage } from '@/components/layout/coming-soon-page'

export const metadata = {
  title: 'Communauté — Bientôt | AI Hub',
  description: 'Espace communautaire AI Hub : discussions, votes et profils — en cours de développement.',
}

export default function CommunityPage() {
  return (
    <ComingSoonPage
      activeNav="Communauté"
      title="Communauté"
      description="Profils, karma, fil « Following » et modération communautaire arrivent dans une prochaine version. En attendant, utilisez le comparateur et le classement Arena."
    />
  )
}
