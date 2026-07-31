import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cobalt: {
          950: "#060b17",
          900: "#0b132b",
          800: "#131c35",
          700: "#1c2541",
          600: "#2a375c",
        },
        gold: {
          400: "#FFE066",
          500: "#F7B801",
          600: "#EAB308",
          700: "#CA8A04",
        },
      },
    },
  },
  plugins: [],
};
export default config;
