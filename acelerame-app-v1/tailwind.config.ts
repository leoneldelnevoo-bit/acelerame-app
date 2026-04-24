import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ══════════════════════════════════════════
        // Paleta "Oro Moderno" — ACELERAME SaaS
        // ══════════════════════════════════════════
        bg: {
          base: '#0F0F0F',       // fondo principal
          elevated: '#1A1A1A',   // cards, modales
          overlay: '#242424',    // hover, secondary panels
        },
        gold: {
          DEFAULT: '#FFD700',    // oro vibrante primario
          hover: '#FFA500',      // naranja-dorado para hovers
          dim: '#C9A227',        // dorado apagado (bordes, iconos secundarios)
          50: '#FFF9E5',
          100: '#FFF0B8',
          200: '#FFE38A',
          300: '#FFD75C',
          400: '#FFD100',
          500: '#FFD700',        // base
          600: '#D4AF00',
          700: '#A88A00',
          800: '#7C6600',
          900: '#524200',
        },
        fg: {
          DEFAULT: '#F5F5F5',    // texto principal (casi blanco)
          muted: '#A0A0A0',      // texto secundario
          subtle: '#707070',     // placeholder, labels
        },
        border: {
          DEFAULT: '#2A2A2A',    // borde sutil
          strong: '#3A3A3A',     // borde más visible
        },
        success: '#00D4AA',
        danger: '#FF3366',
        warning: '#FFB020',
        info: '#4A9EFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(255, 215, 0, 0.2), 0 4px 12px rgba(255, 215, 0, 0.08)',
        'gold-strong': '0 0 0 1px rgba(255, 215, 0, 0.5), 0 8px 24px rgba(255, 215, 0, 0.2)',
        elevation: '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
