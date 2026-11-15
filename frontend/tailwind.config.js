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
        polar: {
          950: '#060B18', // Deepest Antarctic Midnight
          900: '#0B132B', // Dark Navy Command
          850: '#111D42', // Card Surface Dark
          800: '#1C2541', // Card Border / Hover
          700: '#3A506B', // Muted Polar Slate
          600: '#5BC0BE', // Ice Teal
          500: '#00F0FF', // Polar Cyan Highlight
          400: '#6EE7B7', // Emerald Normal
          300: '#FDE047', // Warning Gold
          200: '#F87171', // Alarm Coral
          100: '#E0F2FE', // Glacier Ice White
          50: '#F0F9FF'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
