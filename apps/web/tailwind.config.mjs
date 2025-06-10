/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
        fontSize: {
      'xs': ['0.7rem', {
        lineHeight: '1rem',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      }],
      'sm': ['0.9rem', {
        lineHeight: '1.2rem',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      }],
      'base': ['1.1rem', {
        lineHeight: '1.4rem',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      }],
      'md': ['1.2rem', {
        lineHeight: '1.4rem',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      }],
      'lg': ['1.3rem', {
        lineHeight: '1.4rem',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      }],
      'xl': ['1.4rem', {
        lineHeight: '2.6rem',
        letterSpacing: '-0.01em',
        fontWeight: '500',
      }],
      '2xl': ['1.5rem', {
        lineHeight: '1.6rem',
        letterSpacing: '-0.01em',
        fontWeight: '500',
      }],
      '3xl': ['1.8rem', {
        lineHeight: '2.3rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '4xl': ['2.3rem', {
        lineHeight: '2.6rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '5xl': ['2.6rem', {
        lineHeight: '2.6rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '6xl': ['3.2rem', {
        lineHeight: '3.3rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '7xl': ['3.6rem', {
        lineHeight: '3.6rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '8xl': ['4rem', {
        lineHeight: '3.9rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],
      '9xl': ['4.4rem', {
        lineHeight: '4.2rem',
        letterSpacing: '-0.02em',
        fontWeight: '500',
      }],

    },
      fontFamily: {
        xero: ["xero", "black"],
        basement: ["basement", "black"],
        CommitMono: ["commitmono", "black"],
        neueplakblack: ["neueplakblack", "black"],
        cal: ["cal", "serif"],
        spacemonoregular: ["space-mono-regular", "sans"],
        cerapro_regular: ["cerapro_regular", "sans"],
        cerapro_medium: ["cerapro_medium", "sans"],
        manrope_1: ["manrope_1", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        geist: ["geist", "sans"],
        geistmono: ["geist-mono", "sans"],
        opepen_block: ["opepen_block", "sans"],
        openrunde_sb: ["openrunde_sb", "sans"],
      },

       borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

       dropShadow: {
        'lg': '0 10px 10px rgba(245, 245, 245, 0.2)',
        'xl': '0 20px 20px rgba(255, 71, 0, 0.2)',
        '2xl': '0 35px 35px rgba(255, 71, 0, 0.2)',
        '3xl': '0 30px 30px rgba(255, 71, 0, 0.3)',
      },

      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.2s ease-out",
        "slide-out": "slide-out 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
