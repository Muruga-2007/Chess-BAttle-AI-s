import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        brass: "var(--brass)",
        pine: "var(--pine)",
        ember: "var(--ember)",
        line: "var(--line)",
        mist: "var(--mist)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(196, 163, 110, 0.22), 0 30px 80px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        board: "linear-gradient(90deg, rgba(196,163,110,0.09) 1px, transparent 1px), linear-gradient(rgba(196,163,110,0.09) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
