/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          50: '#F4F2FF',
          100: '#EAE6FF',
          200: '#DDD7FE',
          300: '#C0B0FF',
          400: '#9F88FF',
          500: '#7E61FF',
          600: '#6E54FF', // Primary
          700: '#5A42DE',
          800: '#4834B2',
          900: '#200052',
          950: '#0E091C',
        },
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.03em',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}