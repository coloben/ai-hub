import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code } from 'lucide-react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { OrganizationSchema, BreadcrumbSchema } from '@/app/components/json-ld'
import { CodeBlock } from '@/app/components/code-block'

export const metadata = {
  title: 'API Documentation — AI Hub Public API',
  description: 'API publique gratuite pour accéder aux classements IA, modèles, et papers. JSON, CSV, pas de clé API requise.',
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/models',
    desc: 'Liste tous les modèles avec scores ELO, organisation, catégorie. Données Arena AI.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/models`,
  },
  {
    method: 'GET',
    path: '/api/v1/leaderboard',
    desc: 'Classement global. Paramètre optionnel ?category=proprietary|open-weight.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/leaderboard?category=open-weight`,
  },
  {
    method: 'GET',
    path: '/api/health',
    desc: 'Sonde de santé : Arena, feed arXiv/HF, base de données.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/health`,
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    desc: 'Stats communauté, confiance, feed et persistance.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/stats`,
  },
  {
    method: 'GET',
    path: '/api/v1/openapi.json',
    desc: 'Spécification OpenAPI 3.1 de l\'API publique.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/openapi.json`,
  },
  {
    method: 'GET',
    path: '/api/v1/papers',
    desc: 'Papers récents depuis Hugging Face et arXiv. Paramètre ?limit=10 pour paginer.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/papers?limit=5`,
  },
  {
    method: 'GET',
    path: '/api/v1/dataset/leaderboard.json',
    desc: 'Export JSON complet du leaderboard. Licence CC BY 4.0.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/dataset/leaderboard.json`,
  },
  {
    method: 'GET',
    path: '/api/v1/dataset/leaderboard.csv',
    desc: 'Export CSV du leaderboard. Compatible Excel, pandas, R.',
    example: `curl https://ai-hub-cnb3.vercel.app/api/v1/dataset/leaderboard.csv`,
  },
]

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background grid-dots">
      <OrganizationSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://ai-hub-cnb3.vercel.app/' },
          { name: 'API Documentation', url: 'https://ai-hub-cnb3.vercel.app/docs/api' },
        ]}
      />

      <TopNav />

      <section className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-[11px] font-medium mb-3">
            <Code size={12} />
            API Publique
          </div>
          <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
            API ouverte &amp; gratuite
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground max-w-lg mx-auto">
            Accédez aux classements IA, modèles et papers. Rate limit 100 req/min. Pas de clé API requise.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-semibold">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {[
              { label: 'Lecture', value: '100/min', desc: 'GET' },
              { label: 'Écriture', value: '10/min', desc: 'POST' },
              { label: 'Export', value: '10/min', desc: 'Dataset' },
            ].map((item) => (
              <div key={item.label} className="text-center p-2.5 rounded-md bg-muted/30">
                <p className="text-sm font-bold data-num text-accent">{item.value}</p>
                <p className="text-[11px] font-medium text-foreground mt-0.5">{item.label}</p>
                <p className="text-[9px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-[15px] font-display font-bold text-foreground">Endpoints</h2>
          {ENDPOINTS.map((ep) => (
            <Card key={ep.path} className="card-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-[9px] bg-green-400/10 text-green-400 border-green-400/20">
                    {ep.method}
                  </Badge>
                  <code className="text-[11px] font-mono text-accent">{ep.path}</code>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{ep.desc}</p>
                <CodeBlock code={ep.example} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-accent/[0.03] border-accent/10">
          <CardContent className="p-4 text-center">
            <h2 className="text-[15px] font-display font-bold text-foreground">Open Data</h2>
            <p className="mt-1.5 text-[12px] text-muted-foreground max-w-md mx-auto">
              Toutes nos données sont disponibles sous licence CC BY 4.0. Mentionnez AI Hub comme source.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
