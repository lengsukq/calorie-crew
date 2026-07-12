import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Y2K / Frutiger Aero 主色系
        y2k: {
          cyan: "#01CDFE",
          "cyan-light": "#B0E0E6",
          purple: "#B967FF",
          pink: "#FF71CE",
          "pink-light": "#FFB6C1",
          green: "#7FFF00",
          silver: "#C0C0C0",
          "metal-blue": "#4682B4",
        },
        // 玻璃色板（白色半透明）
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.7)",
          light: "rgba(255, 255, 255, 0.85)",
          lighter: "rgba(255, 255, 255, 0.5)",
          border: "rgba(255, 255, 255, 0.3)",
          "border-light": "rgba(226, 232, 240, 0.3)",
        },
      },
      borderRadius: {
        y2k: "20px",
        "y2k-sm": "12px",
      },
      boxShadow: {
        y2k: "0 8px 32px rgba(0, 0, 0, 0.05)",
        "y2k-card":
          "0 4px 16px rgba(0, 0, 0, 0.05), inset 0 -2px 8px rgba(0, 0, 0, 0.02), inset 0 2px 8px rgba(255, 255, 255, 0.4)",
        "y2k-hover":
          "0 12px 32px rgba(0, 0, 0, 0.1), inset 0 -2px 8px rgba(0, 0, 0, 0.02), inset 0 2px 8px rgba(255, 255, 255, 0.4)",
        "y2k-btn":
          "0 4px 16px rgba(6, 182, 212, 0.3), inset 0 -2px 8px rgba(0, 0, 0, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.3)",
        "y2k-btn-hover":
          "0 8px 24px rgba(6, 182, 212, 0.4), inset 0 -2px 8px rgba(0, 0, 0, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.3)",
        "y2k-icon":
          "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 -2px 6px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(255, 255, 255, 0.4)",
        "y2k-glow": "0 0 20px rgba(1, 205, 254, 0.3)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
