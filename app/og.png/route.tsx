import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ color: '#666', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Live
          </span>
        </div>
        <div style={{ fontSize: '72px', fontWeight: 700, color: '#f0f0f0', lineHeight: 1.05, marginBottom: '24px' }}>
          AI Hub
        </div>
        <div style={{ fontSize: '28px', color: '#666', lineHeight: 1.4, maxWidth: '700px' }}>
          Classements, benchmarks et alertes des modèles IA en temps réel
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
          {['GPT-4o', 'Claude 4', 'Gemini 2.5', 'Llama 4', 'DeepSeek-V3'].map((m) => (
            <div
              key={m}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '6px 14px',
                color: '#999',
                fontSize: '14px',
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
