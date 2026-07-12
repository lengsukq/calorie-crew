import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.12)",
          lighter: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.15)",
          "border-light": "rgba(255, 255, 255, 0.08)",
        },
        forest: {
          50: "#f0f7f1",
          100: "#d9ecdc",
          200: "#b5d9bd",
          300: "#85be94",
          400: "#56a06b",
          500: "#2f6b45",
          600: "#265837",
          700: "#1e462b",
          800: "#173422",
          900: "#0f2216",
          950: "#0a1f0d",
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
        strong: "24px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.25)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.15)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.3)",
        "glass-glow": "0 0 20px rgba(52, 211, 153, 0.15)",
      },
      borderRadius: {
        glass: "16px",
        "glass-sm": "10px",
      },
    },
  },
  plugins: [],
} satisfies Config;
