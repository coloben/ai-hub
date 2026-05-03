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
        // ── Nouveau thème (noir/blanc/gold) ─────────────────────────
        bg:          '#0d0d12',
        surface:     '#14141a',
        'surface-2': '#1a1a22',
        'surface-3': '#1e1e28',
        'surface-offset': '#16161e',
        border:      '#2a2a35',
        'border-2':  '#3a3a45',
        divider:     '#2a2a35',
        text:        '#e8e8ed',
        'text-2':    '#8a8a95',
        'text-3':    '#5a5a65',
        gold:        '#c9a84c',
        success:     '#22c55e',
        error:       '#ef4444',
        warn:        '#f59e0b',
        // ── Alias ancien thème (pages secondaires) ───────────────────
        primary:     '#6366f1',
        'primary-dim': 'rgba(99,102,241,0.12)',
        amber:       '#f59e0b',
        'amber-dim': 'rgba(245,158,11,0.12)',
        'success-dim': 'rgba(34,197,94,0.12)',
        'new-badge': '#a5b4fc',
        'text-muted': '#71717a',
        'text-faint': '#3f3f46',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
        ticker:       'ticker 50s linear infinite',
        'live-dot':   'live-pulse 2s ease infinite',
        'fade-in':    'fadeIn 0.2s ease',
        'slide-up':   'slideUp 0.25s ease',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
