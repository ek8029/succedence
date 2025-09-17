import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'midnight': '#0B0E14',
        'charcoal': {
          DEFAULT: '#1A1D23',
          light: '#252A34',
        },
        'slate': {
          DEFAULT: '#2F3847',
          light: '#3D4757',
        },
        'navy': {
          DEFAULT: '#1B2332',
          light: '#263042',
        },
        'gold': {
          DEFAULT: '#C9A96E',
          light: '#D4B574',
          muted: '#B89A5F',
          subtle: 'rgba(201, 169, 110, 0.1)',
        },
        'warm': {
          white: '#FFFFFF',
          gray: '#4B5563',
        },
        'cool': {
          gray: '#6B7280',
        },
        'platinum': '#E5E7EB',
        'silver': '#D1D5DB',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #0B0E14 0%, #1A1D23 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #1B2332 0%, #2F3847 100%)',
        'card-gradient': 'linear-gradient(145deg, #1A1D23 0%, #2F3847 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0B0E14 0%, #1B2332 50%, #1A1D23 100%)',
        'accent-gradient': 'linear-gradient(135deg, #B89A5F 0%, #C9A96E 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.16)',
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'gold-glow': '0 0 20px rgba(201, 169, 110, 0.2)',
      },
      borderRadius: {
        'luxury': '12px',
        'luxury-lg': '16px',
      },
      spacing: {
        'section': '6rem',
      },
      letterSpacing: {
        'refined': '-0.015em',
        'luxury': '0.025em',
      },
      lineHeight: {
        'refined': '1.6',
        'luxury': '1.8',
      },
    },
  },
  plugins: [],
}
export default config
