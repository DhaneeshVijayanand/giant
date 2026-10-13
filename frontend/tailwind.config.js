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
          950: '#060911',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        accent: {
          blue: '#007AFF', // iOS System Blue
          violet: '#8E44AD',
          purple: '#AF52DE', // iOS System Purple
          green: '#34C759',  // iOS System Green
          orange: '#FF9500', // iOS System Orange
          red: '#FF3B30',    // iOS System Red
          teal: '#30B0C7',   // iOS System Teal
          indigo: '#5856D6', // iOS System Indigo
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
        'glass-sm': '0 2px 10px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'glass-light': '0 8px 30px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
