/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Amber
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#10B981', // Emerald
          foreground: '#FFFFFF',
        },
        background: '#F0F9FF', // Sky 50
        card: '#FFFFFF',
        text: '#1F2937', // Gray 800
      },
      fontFamily: {
        sans: ['"M PLUS Rounded 1c"', 'sans-serif'], // Cute rounded font
      },
      animation: {
        'bounce-short': 'bounce 0.5s infinite',
      }
    },
  },
  plugins: [],
}
