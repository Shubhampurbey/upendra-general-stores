/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kirana: {
          // Warm Cream & Off-Whites
          cream: '#FAF7F2',
          sand: '#F4EFE6',
          beige: '#EADBCE',
          
          // Deep Forest / Cardamom Green
          green: {
            DEFAULT: '#1E5128',
            dark: '#14381C',
            light: '#2E7D32',
            soft: '#E8F5E9',
            border: '#A5D6A7'
          },
          
          // Saffron & Warm Terracotta Orange
          orange: {
            DEFAULT: '#E85D04',
            dark: '#BA4300',
            light: '#F48C06',
            soft: '#FFF3E0',
            border: '#FFCC80'
          },
          
          // Mustard / Turmeric Yellow
          mustard: {
            DEFAULT: '#E5A93C',
            dark: '#C68B25',
            light: '#F6C90E',
            soft: '#FEF9E7',
            border: '#F9E79F'
          },
          
          // Earthy Brown & Cardamom Accents
          brown: {
            DEFAULT: '#4A3B32',
            dark: '#2D2319',
            light: '#6B5B52',
            muted: '#8C7A70',
            soft: '#F5F1EE'
          }
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'kirana': '0 4px 20px -2px rgba(45, 35, 25, 0.08), 0 2px 6px -1px rgba(45, 35, 25, 0.04)',
        'kirana-lg': '0 10px 30px -4px rgba(45, 35, 25, 0.12), 0 4px 10px -2px rgba(45, 35, 25, 0.06)',
        'kirana-glow': '0 0 20px rgba(232, 93, 4, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
