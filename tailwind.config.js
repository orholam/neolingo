/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': '#58cc02',
        'duo-green-dark': '#4ba800',
        'duo-blue': '#1cb0f6',
        'duo-blue-dark': '#0ea5e9',
        'duo-red': '#ff4b4b',
        'duo-yellow': '#ffc800',
        'duo-purple': '#ce82ff',
      },
    },
  },
  plugins: [],
}
