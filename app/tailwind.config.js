/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: {
          50: "#f0f5ff",
          100: "#e0ebff",
          200: "#c7d7fe",
          300: "#a4bbfc",
          400: "#7a94f9",
          500: "#5a6ef3",
          600: "#4349e7",
          700: "#3738cc",
          800: "#2e31a5",
          900: "#1a1d5e",
          950: "#0d0f2b",
        },
      },
    },
  },
  plugins: [],
};
