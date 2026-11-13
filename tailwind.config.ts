import type { Config } from "tailwindcss";

export default {
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
        // Compatibility alias: the round-table theme uses periwinkle, not gold.
        gold: {
          DEFAULT: "#9fb4e6",
          bright: "#dbe4ff",
        },
        parchment: "#e6ebf9",
        ink: "#090d18",
        panel: "#111829",
        blood: "#c8423a",
      },
      fontFamily: {
        // Legacy CSS variable name, now supplied by bundled Cormorant.
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
