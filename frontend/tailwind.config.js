/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
        },
        slate: {
          850: '#151e2e',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        },
        highlightRow: {
          '0%': { backgroundColor: 'rgba(13, 148, 136, 0.25)' },
          '100%': { backgroundColor: 'transparent' }
        }
      },
      animation: {
        'ripple': 'ripple 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
        'highlight': 'highlightRow 2.5s ease-out',
      }
    },
  },
  plugins: [],
}
