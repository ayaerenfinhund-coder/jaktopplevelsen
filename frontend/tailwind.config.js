/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Forest Green
        primary: {
          50: '#f0f7ed',
          100: '#d8eacd',
          200: '#b3d69c',
          300: '#8bc16a',
          400: '#69ab43',
          500: '#4d8f2b',
          600: '#3d7222',
          700: '#2d5016', // Main primary
          800: '#233f11',
          900: '#1a2f0d',
          950: '#0d1807',
        },
        // Secondary - Earth Brown
        secondary: {
          50: '#fdf8ed',
          100: '#f9ecd0',
          200: '#f2d69e',
          300: '#e9bc65',
          400: '#e2a33c',
          500: '#d18b22',
          600: '#b8721a',
          700: '#8b6914', // Main secondary
          800: '#72510f',
          900: '#5e420c',
          950: '#362406',
        },
        // Accent - Autumn Orange
        accent: {
          50: '#fef6f0',
          100: '#fce9db',
          200: '#f9cfb6',
          300: '#f4ac86',
          400: '#ee8254',
          500: '#d4752e', // Main accent
          600: '#c25f23',
          700: '#a1491d',
          800: '#823c1b',
          900: '#6a3318',
          950: '#3a180a',
        },
        // Background colors for dark mode
        background: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          lighter: '#3A3A3A',
          dark: '#0F0F0F',
        },
        // Text colors
        text: {
          primary: '#F5F5F5',
          secondary: '#B0B0B0',
          muted: '#707070',
        },
        // Status colors
        success: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        112: '28rem',
        128: '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 4px 6px -1px rgb(0 0 0 / 0.3)',
        glow: '0 0 20px rgb(45 80 22 / 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
