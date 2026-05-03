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
        // ── Base OLED ────────────────────────────────────────────────
        bg:            '#07070f',
        surface:       'rgba(255,255,255,0.04)',
        'surface-2':   'rgba(255,255,255,0.07)',
        'surface-3':   'rgba(255,255,255,0.10)',
        'surface-offset': '#0f0f1a',
        border:        'rgba(255,255,255,0.08)',
        'border-2':    'rgba(255,255,255,0.15)',
        divider:       'rgba(255,255,255,0.06)',
        // ── Texte ────────────────────────────────────────────────────
        text:          '#f0f0f7',
        'text-2':      '#9090a8',
        'text-3':      '#55556a',
        // ── Accents ──────────────────────────────────────────────────
        primary:       '#2563eb',
        'primary-dim': 'rgba(37,99,235,0.12)',
        cyan:          '#06b6d4',
        'cyan-dim':    'rgba(6,182,212,0.12)',
        violet:        '#7c3aed',
        'violet-dim':  'rgba(124,58,237,0.12)',
        gold:          '#d4a843',
        // ── Sémantique ───────────────────────────────────────────────
        success:       '#10b981',
        'success-dim': 'rgba(16,185,129,0.12)',
        error:         '#ef4444',
        warn:          '#f59e0b',
        amber:         '#f59e0b',
        'amber-dim':   'rgba(245,158,11,0.12)',
        // ── Aliases compat ───────────────────────────────────────────
        'new-badge':   '#93c5fd',
        'text-muted':  '#6b7280',
        'text-faint':  '#374151',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
        xs:   '11px',
        sm:   '12px',
        base: '13px',
        md:   '14px',
        lg:   '15px',
        xl:   '18px',
        '2xl': '22px',
        '3xl': '28px',
        '4xl': '36px',
      },
      letterSpacing: {
        widest: '0.14em',
      },
      animation: {
        ticker:          'ticker 50s linear infinite',
        'live-dot':      'live-pulse 2s ease infinite',
        'fade-in':       'fadeIn 0.2s ease both',
        'slide-up':      'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right':'slideInRight 0.28s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':       'shimmer 1.6s ease infinite',
        'vote-pop':      'votePop 320ms cubic-bezier(0.34,1.56,0.64,1) both',
        'karma-float':   'karmaFloat 850ms cubic-bezier(0.16,1,0.3,1) forwards',
        'score-glow':    'scoreGlow 550ms ease both',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        votePop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.5)' },
          '70%':  { transform: 'scale(0.88)' },
          '100%': { transform: 'scale(1.1)' },
        },
        karmaFloat: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-24px) scale(0.8)' },
        },
        scoreGlow: {
          '0%, 100%': { textShadow: 'none' },
          '50%':      { textShadow: '0 0 14px rgba(6,182,212,0.75)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
