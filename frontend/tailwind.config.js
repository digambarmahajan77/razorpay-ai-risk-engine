/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#111c2e',
          900: '#0f172a',
          950: '#090d16',
        },
        brand: {
          50: '#f0fdfa',
          500: '#0d9488',
          600: '#0d9488',
          700: '#0f766e',
          accent: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
