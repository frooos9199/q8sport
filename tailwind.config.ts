import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E31E24",
        "primary-dark": "#B71518",
        dark: "#0A0A0A",
        "dark-light": "#1A1A1A",
        "dark-card": "#141414",
        metal: "#2A2A2A",
        "metal-light": "#3A3A3A",
        silver: "#C0C0C0",
      },
      fontFamily: {
        arabic: ["Tajawal", "sans-serif"],
        english: ["Rajdhani", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
