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
        bg:          '#000000',
        surface:     '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#161616',
        border:      '#1e1e1e',
        'border-2':  '#2a2a2a',
        text:        '#f0f0f0',
        'text-2':    '#666666',
        'text-3':    '#333333',
        gold:        '#c9a84c',
        success:     '#22c55e',
        error:       '#ef4444',
        warn:        '#f59e0b',
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
        ticker:     'ticker 50s linear infinite',
        'live-dot': 'live-pulse 2s ease infinite',
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
      },
    },
  },
  plugins: [],
}
export default config
