import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}','./app-v2/**/*.{js,ts,jsx,tsx,mdx}','./lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Base
        bg: '#0B0B0F',
        // Surfaces
        surface: {
          DEFAULT: '#141418',
          2: '#1A1A20',
          3: '#222228',
        },
        // Borders
        edge: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.15)',
        },
        // Text — 4 levels for better hierarchy
        ink: {
          primary: 'rgba(255,255,255,0.92)',
          secondary: 'rgba(255,255,255,0.60)',
          tertiary: 'rgba(255,255,255,0.40)',
          quaternary: 'rgba(255,255,255,0.20)',
        },
        // Data accent — teal
        data: '#00d4aa',
        'data-dim': 'rgba(0,212,170,0.10)',
        // States
        up: '#22c55e',
        down: '#ef4444',
        alert: '#ff6b00',
        // Semantic
        primary: '#00d4aa',
        success: '#22c55e',
        warn: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Backward compat
        text: {
          DEFAULT: 'rgba(255,255,255,0.92)',
          2: 'rgba(255,255,255,0.60)',
          3: 'rgba(255,255,255,0.40)',
        },
        border: 'rgba(255,255,255,0.05)',
        'border-hover': 'rgba(255,255,255,0.10)',
        divider: 'rgba(255,255,255,0.05)',
        // ── V2 Design System — CSS Variables ──
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
          glow: 'var(--accent-glow)',
          foreground: 'var(--accent-foreground)',
          2: 'var(--accent-2)',
          '2-dim': 'var(--accent-2-dim)',
          '2-glow': 'var(--accent-2-glow)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          hover: 'var(--card-hover)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          dim: 'var(--destructive-dim)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      backgroundColor: {
        'primary-dim': 'rgba(0,212,170,0.10)',
        'success-dim': 'rgba(34,197,94,0.10)',
        'warn-dim': 'rgba(245,158,11,0.10)',
        'amber-dim': 'rgba(245,158,11,0.10)',
        'error-dim': 'rgba(239,68,68,0.10)',
        'info-dim': 'rgba(59,130,246,0.10)',
        'new-badge': '#00d4aa',
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
        xl: '16px',
        '2xl': '20px',
        radius: 'var(--radius)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out both',
        'slide-up': 'slideUp 0.2s ease-out both',
        'slide-right': 'slideRight 0.22s ease-out both',
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
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
