/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        highlightRow: {
          '0%': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
          '100%': { backgroundColor: 'transparent' }
        }
      },
      animation: {
        'highlight': 'highlightRow 2.5s ease-out',
      }
    },
  },
  plugins: [],
}
