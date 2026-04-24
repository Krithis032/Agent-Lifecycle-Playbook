import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'Geist Mono'", "'SF Mono'", "'Fira Code'", "monospace"],
      },
      colors: {
        background: "var(--bg)",
        foreground: "var(--text)",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
export default config;
