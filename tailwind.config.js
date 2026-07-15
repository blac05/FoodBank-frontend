/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0E1A",
        panel: "#101528",
        rescue: "#39FF6A",
        signal: "#3E9EFF",
        amberflag: "#FFB020",
        mist: "#E7ECF7",
        muted: "#8993B0",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(57, 255, 106, 0.35)",
        glowBlue: "0 0 24px rgba(62, 158, 255, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
