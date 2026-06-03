import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#020c1a", primary: "#2979FF", accent: "#00E5FF",
        gold: "#FFD740", green: "#00C853", red: "#FF5252",
        surface: "#071428", border: "#0d2240",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "sans-serif"] },
    },
  },
  plugins: [],
}
export default config
