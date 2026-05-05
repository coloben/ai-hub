import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}','./lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // VOID Design System - Minimalist Black & White
        void: {
          black: '#000000',
          950: '#030303',
          900: '#0a0a0a',
          800: '#111111',
          700: '#141414',
          600: '#1a1a1a',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
          200: '#404040',
          100: '#555555',
        },
        // Semantic colors
        bg: '#000000',
        surface: '#0a0a0a',
        'surface-elevated': '#111111',
        'surface-highlight': '#141414',
        border: 'rgba(255,255,255,0.06)',
        'border-hover': 'rgba(255,255,255,0.12)',
        'border-strong': 'rgba(255,255,255,0.20)',
        divider: 'rgba(255,255,255,0.04)',
        // Text hierarchy
        text: '#ffffff',
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255,255,255,0.70)',
        'text-tertiary': 'rgba(255,255,255,0.50)',
        'text-quaternary': 'rgba(255,255,255,0.30)',
        // Accent (minimal - cyan for data, amber for alerts)
        accent: '#00d4aa',
        'accent-dim': 'rgba(0,212,170,0.10)',
        'accent-glow': 'rgba(0,212,170,0.30)',
        signal: '#ff6b00',
        'signal-dim': 'rgba(255,107,0,0.10)',
        // States
        success: '#22c55e',
        'success-dim': 'rgba(34,197,94,0.10)',
        error: '#ef4444',
        'error-dim': 'rgba(239,68,68,0.10)',
        warn: '#f59e0b',
        'warn-dim': 'rgba(245,158,11,0.10)',
        info: '#3b82f6',
        'info-dim': 'rgba(59,130,246,0.10)',
        // Vote colors
        upvote: '#00d4aa',
        downvote: '#ef4444',
        // Rank colors (medals)
        gold: '#fbbf24',
        silver: '#a1a1aa',
        bronze: '#b45309',
      },
      fontFamily: {
        sans: ['Inter','-apple-system','BlinkMacSystemFont','Segoe UI','system-ui','sans-serif'],
        mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','monospace'],
        display: ['Inter','system-ui','sans-serif'],
      },
      fontSize: {
        // VOID Type Scale - 4px grid
        '2xs': ['11px',{lineHeight:'14px',letterSpacing:'0.02em'}],
        xs: ['12px',{lineHeight:'16px',letterSpacing:'0.01em'}],
        sm: ['13px',{lineHeight:'18px'}],
        base: ['14px',{lineHeight:'20px'}],
        md: ['15px',{lineHeight:'22px'}],
        lg: ['16px',{lineHeight:'24px'}],
        xl: ['18px',{lineHeight:'26px',letterSpacing:'-0.01em'}],
        '2xl': ['20px',{lineHeight:'28px',letterSpacing:'-0.02em'}],
        '3xl': ['24px',{lineHeight:'32px',letterSpacing:'-0.02em'}],
        '4xl': ['30px',{lineHeight:'38px',letterSpacing:'-0.03em'}],
        '5xl': ['36px',{lineHeight:'44px',letterSpacing:'-0.03em'}],
        // Data sizes (tabular nums)
        'data-sm': ['13px',{lineHeight:'16px',fontWeight:'600'}],
        'data-md': ['16px',{lineHeight:'20px',fontWeight:'700'}],
        'data-lg': ['24px',{lineHeight:'28px',fontWeight:'700'}],
        'data-xl': ['32px',{lineHeight:'36px',fontWeight:'800'}],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out both',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down': 'slideDown 0.2s ease-out both',
        'live-pulse': 'livePulse 2s ease-in-out infinite',
        'vote-pop': 'votePop 200ms cubic-bezier(0.34,1.56,0.64,1) both',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'ticker': 'ticker 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.9)' },
        },
        votePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,212,170,0)' },
          '100%': { boxShadow: '0 0 20px 2px rgba(0,212,170,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glass': '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'glass-hover': '0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.5)',
        'elevated': '0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px rgba(0,0,0,0.6)',
        'glow-accent': '0 0 0 1px rgba(0,212,170,0.3), 0 0 20px rgba(0,212,170,0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
export default config
