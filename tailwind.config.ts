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
        navy: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        brand: {
          blue: "#0EA5E9",
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#EF4444",
          purple: "#8B5CF6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
