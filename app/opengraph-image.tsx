import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI Hub — Communauté IA et classement Arena certifié'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#e8b86d',
            marginBottom: 16,
          }}
        >
          AI Hub
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Communauté IA · Données Arena certifiées
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: 'rgba(255,255,255,0.65)' }}>
          Feed · Hubs · Comparateur A vs B · arXiv & Hugging Face
        </div>
      </div>
    ),
    { ...size }
  )
}
