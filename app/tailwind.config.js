/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: {
          50: "#e8f4f8",
          100: "#c5e4ed",
          200: "#8ec8db",
          300: "#5ba8c4",
          400: "#3d8aaa",
          500: "#2a6f8e",
          600: "#1f5670",
          700: "#163f54",
          800: "#0e2a3a",
          900: "#081a26",
          950: "#040e15",
        },
        biolume: {
          cyan: "#00ffd5",
          blue: "#00aaff",
          pink: "#ff00aa",
          green: "#00ff88",
          purple: "#aa55ff",
          gold: "#ffcc00",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "drift": "drift 20s linear infinite",
        "bubble": "bubble 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        drift: {
          "0%": { transform: "translateX(-100%) translateY(0)" },
          "100%": { transform: "translateX(100vw) translateY(-40px)" },
        },
        bubble: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-30px) scale(1.1)", opacity: "0.3" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
