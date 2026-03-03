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
        'serif': ['var(--font-serif)', 'Georgia', 'serif'],
        'sans': ['var(--font-sans)', 'system-ui', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Institutional Typography Scale
        'hero': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],      // 56px
        'hero-mobile': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }], // 40px
        'h1': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],         // 56px
        'h2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],           // 32px
        'h3': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '500' }],        // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],         // 18px
        'body': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],                // 16px
        'label': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],      // 14px
        'micro': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.005em', fontWeight: '400' }],      // 12px
      },
      fontWeight: {
        // Institutional Weight Scale (reduced from original)
        'regular': '400',
        'medium': '500',
        'semibold': '600',
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
        'tight-institutional': '-0.02em',   // Hero headlines
        'tight': '-0.01em',                 // Section headlines
        'tighter': '-0.005em',              // Subsection headlines
        'normal': '0',                      // Body text
        'ui': '0.01em',                     // Labels and UI
        'caps': '0.05em',                   // Uppercase text
      },
      lineHeight: {
        'hero': '1.15',         // Hero headlines (compact, authoritative)
        'heading': '1.25',      // Section headlines
        'subheading': '1.3',    // Subsection headlines
        'body': '1.5',          // Body text (tighter than 1.8)
        'body-relaxed': '1.6',  // Large body text
        'ui': '1.4',            // Labels and UI elements
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
