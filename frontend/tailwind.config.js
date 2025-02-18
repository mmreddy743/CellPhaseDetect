// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wisc-red': {
          DEFAULT: '#c5050c',
          dark: '#9b0000',
          light: '#dc3545',
        },
        'primary': {
          DEFAULT: '#c5050c',
          dark: '#9b0000',
          light: '#dc3545',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'nav': '0 2px 4px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}