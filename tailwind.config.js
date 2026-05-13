/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0D10',
          secondary: '#12151B',
        },
        card: '#171B22',
        border: '#262C36',
        text: {
          primary: '#F5F7FA',
          secondary: '#8B93A1',
        },
        status: {
          critical: '#FF4D4F',
          warning: '#FFB020',
          healthy: '#22C55E',
          selected: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
