import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: undefined,

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        chat: {
          primary: "#6366F1",
          secondary: "#EC4899",
          accent: "#8B5CF6",
          surface: "#F8FAFC",
          sent: "#6366F1",
          received: "#F1F5F9",
          receivedDark: "#1E293B",
        },
      },

      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
    },

    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      "chat-bubble": "1.25rem",
    },

    keyframes: {
      "pop-in": {
        "0%": { transform: "scale(0.95)", opacity: "0" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
      "slide-up": {
        "0%": { transform: "translateY(10px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      typing: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-4px)" },
      },
    },
    animation: {
      "pop-in": "pop-in 0.15s cubic-bezier(0, 0, 0.2, 1) forwards",
      "slide-up": "slide-up 0.2s ease-out forwards",
      typing: "typing 1s infinite ease-in-out",
    },
  },
  plugins: [],
};

export default config;
