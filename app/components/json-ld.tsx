'use client'

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ data }: JsonLdProps) {
  const structuredData = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data }
    : { '@context': 'https://schema.org', ...data }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/* ── Preset schemas ─────────────────────────────────────────────────────── */

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        '@type': 'Organization',
        name: 'AI Hub',
        url: 'https://ai-hub-cnb3.vercel.app',
        logo: 'https://ai-hub-cnb3.vercel.app/og.png',
        description: 'Plateforme communautaire de veille et de benchmark sur les modèles d\'intelligence artificielle.',
        sameAs: [
          'https://twitter.com/AIHubBenchmarks',
        ],
      }}
    />
  )
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        '@type': 'WebSite',
        name: 'AI Hub',
        url: 'https://ai-hub-cnb3.vercel.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://ai-hub-cnb3.vercel.app/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <JsonLd
      data={{
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}

export function FAQPageSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
  return (
    <JsonLd
      data={{
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  )
}

export function DatasetSchema({
  name,
  description,
  url,
  dateModified,
}: {
  name: string
  description: string
  url: string
  dateModified: string
}) {
  return (
    <JsonLd
      data={{
        '@type': 'Dataset',
        name,
        description,
        url,
        dateModified,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: {
          '@type': 'Organization',
          name: 'AI Hub',
        },
      }}
    />
  )
}
