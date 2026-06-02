import { Card, CardContent } from '@/components/ui/card'
import { Shield, Database, Users, Globe, GitBranch } from 'lucide-react'
import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { OrganizationSchema, BreadcrumbSchema, FAQPageSchema } from '@/app/components/json-ld'

export const metadata = {
  title: 'À Propos — Méthodologie & Transparence | AI Hub',
  description: 'Découvrez la méthodologie derrière AI Hub. Sources de données, transparence, et open data.',
}

const FAQS = [
  {
    question: "Comment AI Hub classe-t-il les modèles d'IA ?",
    answer: "Notre classement est basé sur les scores ELO d'Arena AI (anciennement LMSYS Chatbot Arena), la plateforme de benchmark crowdsourced la plus suivie au monde. Des milliers de votes réels déterminent le classement.",
  },
  {
    question: "Qu'est-ce que le benchmark communautaire ?",
    answer: "N'importe qui peut voter dans des duels A vs B pour comparer deux modèles sur une catégorie spécifique (code, créativité, raisonnement, français, multimodal). Ces votes alimentent un classement indépendant.",
  },
  {
    question: "Les données sont-elles ouvertes ?",
    answer: "Oui. Nous publions un export du leaderboard au format CSV et JSON sous licence Creative Commons BY 4.0. Les développeurs peuvent aussi utiliser notre API publique gratuitement.",
  },
  {
    question: "Quelle est la fréquence de mise à jour ?",
    answer: "Le classement Arena AI est mis à jour quotidiennement via des snapshots automatisés. Les papers Hugging Face et arXiv sont indexés en continu. Le cache est rafraîchi toutes les 5 minutes.",
  },
  {
    question: "D'où viennent les données ?",
    answer: "Trois sources principales : Arena AI (classement ELO crowdsourced), Hugging Face Papers (recherche en IA), et arXiv cs.AI (articles scientifiques). Toutes les sources sont vérifiables.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background grid-dots">
      <OrganizationSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://ai-hub-cnb3.vercel.app/' },
          { name: 'À Propos', url: 'https://ai-hub-cnb3.vercel.app/about' },
        ]}
      />
      <FAQPageSchema questions={FAQS} />

      <TopNav />

      <section className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <h1 className="text-xl md:text-3xl font-display font-bold tracking-tight text-foreground">
            Transparence totale
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
            AI Hub est construit sur des données vérifiables et une méthodologie publique.
            Pas d&apos;algorithme opaque. Pas de conflit d&apos;intérêt. Juste les faits.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Database, title: 'Arena AI ELO', desc: 'Le benchmark crowdsourced le plus fiable. Des milliers de votes réels pour évaluer les modèles.' },
            { icon: Users, title: 'Communauté', desc: 'Les utilisateurs votent A vs B par catégorie. La voix de la communauté, pas un black box.' },
            { icon: GitBranch, title: 'Recherche', desc: 'Papers Hugging Face et arXiv cs.AI. Un modèle cité souvent = impact réel sur la recherche.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="card-lift">
                <CardContent className="p-4">
                  <Icon size={18} className="text-accent mb-2" />
                  <h3 className="text-[13px] font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-base font-display font-bold text-foreground mb-4">Questions fréquentes</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <h3 className="text-[13px] font-semibold text-foreground mb-1.5">{faq.question}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Open Data */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card className="bg-accent/[0.03] border-accent/10">
          <CardContent className="p-5 text-center">
            <Globe size={20} className="text-accent mx-auto mb-2" />
            <h2 className="text-base font-display font-bold text-foreground">Open Data</h2>
            <p className="mt-2 text-[12px] text-muted-foreground max-w-md mx-auto">
              Toutes nos données sont disponibles gratuitement sous licence CC BY 4.0.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Link href="/api/v1/dataset/leaderboard.csv" className="inline-flex items-center justify-center h-7 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
                Télécharger CSV
              </Link>
              <Link href="/docs/api" className="inline-flex items-center justify-center h-7 px-3 text-xs rounded-md bg-accent text-accent-foreground font-medium">
                API Documentation
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
