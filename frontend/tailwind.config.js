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
        navy: {
          950: '#000000', // Pure Luxury Obsidian Black
          900: '#060814',
          850: '#0A0E24',
          800: '#111738',
          700: '#1E2558',
          600: '#2C3480',
        },
        cobalt: {
          950: '#060814',
          900: '#0D1130',
          800: '#181F54',
          700: '#232B70',
          DEFAULT: '#2C3480', // Cobalt Blue Deep
          600: '#343E99',
          500: '#4350C7',
          400: '#6472E8',
        },
        accent: {
          blue: '#2C3480', // Cobalt Blue Deep (#2C3480)
          cobalt: '#2C3480',
          violet: '#8E44AD',
          purple: '#AF52DE',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          teal: '#30B0C7',
          indigo: '#5856D6',
        },
        ios: {
          blue: '#2C3480', // Cobalt Blue Deep
          cobalt: '#2C3480',
          indigo: '#5856D6',
          purple: '#AF52DE',
          teal: '#30B0C7',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '26px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass-sm': '0 2px 10px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'glass-cobalt': '0 8px 32px 0 rgba(44, 52, 128, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
      }
    },
  },
  plugins: [],
}
