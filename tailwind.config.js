/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "blue-accent": "#3b82f6",
        "blue-accent-dark": "#1e40af",
        "brand-gray": "#1f2937",
        "brand-slate": "#111827"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
