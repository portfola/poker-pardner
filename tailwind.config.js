/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          900: '#3E2723',
          800: '#4E342E',
          700: '#5D4037',
          600: '#6D4C41',
          500: '#795548',
        },
        leather: {
          900: '#3E2723',
          800: '#4A2C2A',
          700: '#5C3A35',
        },
        gold: {
          600: '#B8860B',
          500: '#D4AF37',
          400: '#DAA520',
        },
        whiskey: {
          800: '#8B4513',
          700: '#A0522D',
          600: '#CD853F',
        },
        felt: {
          900: '#0D5016',
          800: '#1B7523',
          700: '#2E8B30',
          600: '#43A047',
        },
        sand: {
          200: '#E8D5B7',
          100: '#F5E6D3',
          50: '#FBF3E6',
        },
      },
      fontFamily: {
        display: ['Rye', 'serif'],
        body: ['Roboto Slab', 'serif'],
        accent: ['Alfa Slab One', 'cursive'],
      },
      keyframes: {
        deal: {
          'from': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.3)' },
          'to': { opacity: '1', transform: 'translate(0, 0) scale(1)' },
        },
        flip: {
          'from': { transform: 'rotateY(180deg)' },
          'to': { transform: 'rotateY(0deg)' },
        },
      },
      animation: {
        'deal': 'deal 0.4s ease-out forwards',
        'flip': 'flip 0.6s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
