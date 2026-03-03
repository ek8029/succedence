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
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'surface-color': '#0D0D12',
        'text-primary': '#F5F5F5',
        'text-secondary': '#B5B5C5',
        'accent-color': '#D19B3E',
        'deep-navy': '#0D1B2A',
        'navy-dark': '#08141E',
        'navy-light': '#1B2A3E',
        'charcoal': '#2C3E50',
        'slate': '#465A6F',
        'amber': {
          DEFAULT: '#D19B3E',
          light: '#E6A238',
          dark: '#B87308',
          subtle: 'rgba(209, 155, 62, 0.12)',
        },
        'off-white': '#F5F0E8',
        'warm-white': '#FDFBF7',
        'silver': '#CBD5E0',
        'gray': '#8895A7',
      },
      backgroundImage: {
        'primary-gradient': '#0D1B2A',
        'accent-gradient': '#D4880F',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'luxury': '12px',
        'luxury-lg': '16px',
      },
      spacing: {
        // Layout System Design Tokens
        // Section vertical spacing (py-*)
        'section-hero': '6rem',      // 96px - py-24
        'section-hero-md': '8rem',   // 128px - md:py-32
        'section': '4rem',           // 64px - py-16
        'section-md': '5rem',        // 80px - md:py-20
        'section-tight': '3rem',     // 48px - py-12
        'section-tight-md': '4rem',  // 64px - md:py-16

        // Component spacing (gap-*)
        'component-xs': '1rem',      // 16px - gap-4
        'component-sm': '1.5rem',    // 24px - gap-6
        'component-md': '2rem',      // 32px - gap-8
        'component-lg': '3rem',      // 48px - gap-12
        'component-xl': '4rem',      // 64px - gap-16
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
