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
        bg: '#09090b',
        surface: '#111113',
        'surface-2': '#18181b',
        'surface-offset': '#1c1c1f',
        'surface-dynamic': '#27272a',
        border: '#3f3f46',
        divider: '#27272a',
        text: '#e4e4e7',
        'text-muted': '#a1a1aa',
        'text-faint': '#52525b',
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        'primary-dim': '#312e81',
        amber: '#f59e0b',
        'amber-dim': '#451a03',
        success: '#22c55e',
        error: '#ef4444',
        'new-badge': '#0ea5e9',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '11px',
        xs: '12px',
        sm: '13px',
        base: '14px',
        lg: '15px',
        xl: '18px',
        '2xl': '24px',
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        sm: '0 1px 3px oklch(0 0 0 / 0.4)',
        md: '0 4px 16px oklch(0 0 0 / 0.5)',
      },
    },
  },
  plugins: [],
}
export default config
