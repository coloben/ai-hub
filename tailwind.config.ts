import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Surfaces (noir → gris anthracite) ──────────────────────
        bg:          '#000000',
        surface:     '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#1a1a1a',
        // ── Bordures (blanc sur noir, visibles) ────────────────────
        border:      'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.14)',
        'border-strong': 'rgba(255,255,255,0.18)',
        divider:     'rgba(255,255,255,0.06)',
        // ── Texte ───────────────────────────────────────────────────
        text:        '#f1f1f3',
        'text-2':    '#9898a5',
        'text-3':    '#5c5c6a',
        // ── Accents ─────────────────────────────────────────────────
        primary:     '#3b82f6',
        'primary-dim': '#1e3a5f',
        'primary-soft': '#1a2740',
        // ── Sémantique ──────────────────────────────────────────────
        success:     '#22c55e',
        'success-dim': '#0a2a15',
        error:       '#ef4444',
        'error-dim':  '#2d0a0a',
        warn:        '#f59e0b',
        'warn-dim':   '#2a1a05',
        info:        '#06b6d4',
        'info-dim':   '#0a1a22',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs':  ['10px', { lineHeight: '14px' }],
        xs:     ['11px', { lineHeight: '16px' }],
        sm:     ['12px', { lineHeight: '17px' }],
        base:   ['13px', { lineHeight: '20px' }],
        md:     ['14px', { lineHeight: '21px' }],
        lg:     ['16px', { lineHeight: '24px' }],
        xl:     ['18px', { lineHeight: '26px' }],
        '2xl':  ['22px', { lineHeight: '30px' }],
        '3xl':  ['28px', { lineHeight: '36px' }],
        '4xl':  ['36px', { lineHeight: '44px' }],
      },
      borderRadius: {
        sm:  '6px',
        md:  '8px',
        lg:  '10px',
        xl:  '12px',
        '2xl':'16px',
        '3xl':'20px',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease both',
        'slide-up':   'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':'slideRight 0.28s cubic-bezier(0.16,1,0.3,1) both',
        'live-pulse': 'livePulse 2s ease infinite',
        'vote-pop':   'votePop 320ms cubic-bezier(0.34,1.56,0.64,1) both',
        'float-up':   'floatUp 850ms cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer:      'shimmer 1.6s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        votePop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.45)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1.08)' },
        },
        floatUp: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-22px) scale(0.85)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
