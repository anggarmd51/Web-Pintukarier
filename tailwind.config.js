/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1E2B45',
        teal: '#00D2B8',
        light: '#F8FAFC'
      }
    },
  },
  plugins: [],
}