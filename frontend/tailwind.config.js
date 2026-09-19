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
        // Softer, lighter natural leaf / sage greens (calm, clean, not harsh neon or pitch black)
        leaf: {
          50: '#f6faf7',
          100: '#e8f3ea',
          200: '#d5e7d8',
          300: '#b4d7bb',
          400: '#8ec497',
          500: '#64a670',
          600: '#4e8d5a',
          700: '#3e7048',
          800: '#32583a',
          900: '#27442d',
          950: '#16281b',
        },
        // Softer, lighter warm champagne / honey gold (warm, gentle, not loud neon amber)
        gold: {
          50: '#fdfcf7',
          100: '#f9f5e8',
          200: '#f3ebd1',
          300: '#eadcb3',
          400: '#dec78d',
          500: '#cca95f',
          600: '#b48f43',
          700: '#947230',
          800: '#755823',
          900: '#5c441a',
          950: '#38280d',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#141d16',
          darker: '#0c130d'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(62, 112, 72, 0.06)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'gold-glow': '0 8px 20px -4px rgba(204, 169, 95, 0.2)',
        'leaf-glow': '0 8px 20px -4px rgba(78, 141, 90, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
