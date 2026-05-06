import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}','./lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ARENA v2 — Warm dark background, surface islands
        arena: {
          bg: '#0B0B0F',
          surface: '#141418',
          line: '#1E1E24',
          hover: '#1A1A20',
          active: '#222228',
        },
        // Borders — 2 levels only
        edge: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.20)',
        },
        // Text — 3 levels only
        ink: {
          primary: 'rgba(255,255,255,0.90)',
          secondary: 'rgba(255,255,255,0.55)',
          tertiary: 'rgba(255,255,255,0.30)',
        },
        // Data accent
        data: '#00d4aa',
        'data-dim': 'rgba(0,212,170,0.10)',
        // States
        up: '#22c55e',
        down: '#ef4444',
        alert: '#ff6b00',
      },
      fontFamily: {
        sans: ['Inter','-apple-system','BlinkMacSystemFont','Segoe UI','system-ui','sans-serif'],
        mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','monospace'],
      },
      fontSize: {
        '2xs': ['11px',{lineHeight:'14px',letterSpacing:'0.02em'}],
        xs: ['12px',{lineHeight:'16px'}],
        sm: ['13px',{lineHeight:'18px'}],
        base: ['14px',{lineHeight:'20px'}],
        md: ['16px',{lineHeight:'22px'}],
        lg: ['20px',{lineHeight:'28px',letterSpacing:'-0.02em'}],
        xl: ['24px',{lineHeight:'30px',letterSpacing:'-0.02em'}],
        '2xl': ['32px',{lineHeight:'36px',letterSpacing:'-0.03em'}],
        '3xl': ['48px',{lineHeight:'48px',letterSpacing:'-0.04em'}],
        // Data display
        'data-sm': ['13px',{lineHeight:'16px',fontWeight:'600'}],
        'data-md': ['18px',{lineHeight:'22px',fontWeight:'700'}],
        'data-lg': ['28px',{lineHeight:'30px',fontWeight:'700'}],
        'data-xl': ['42px',{lineHeight:'42px',fontWeight:'800'}],
      },
      spacing: {
        sidebar: '56px',
        '18': '4.5rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out both',
        'slide-up': 'slideUp 0.2s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'ticker': 'ticker 50s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
