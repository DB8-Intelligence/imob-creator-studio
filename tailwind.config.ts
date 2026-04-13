import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // ─── Fonts ────────────────────────────────────────────────────────────
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body:    ["'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        rubik:   ["'Rubik'", "sans-serif"],
      },

      // ─── Design-system color tokens ───────────────────────────────────────
      colors: {
        // Shadcn/Radix CSS-var tokens (keep for app UI)
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring:   "hsl(var(--sidebar-ring))",
        },
        // Public design-system palette
        ds: {
          bg:          "#05080B",
          surface:     "#0B1420",
          "surface-2": "#0F1E2E",
          ocean:       "#0B1F2A",
          "ocean-2":   "#123C4A",
          gold:        "#D4AF37",
          "gold-light": "#F2C94C",
          "gold-dim":  "#A07A1A",
          cyan:        "#00F2FF",
          "cyan-dim":  "#00B8C4",
          fg:          "#F5F7FA",
          "fg-muted":  "#A0AEC0",
          "fg-subtle": "#4A5568",
          border:      "rgba(255,255,255,0.07)",
          "border-2":  "rgba(255,255,255,0.12)",
        },
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ─── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        "gold-sm": "0 0 20px rgba(212, 175, 55, 0.15)",
        "gold-md": "0 0 40px rgba(212, 175, 55, 0.25)",
        "gold-lg": "0 0 80px rgba(212, 175, 55, 0.20)",
        "cyan-sm": "0 0 20px rgba(0, 242, 255, 0.10)",
        "glass":   "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card":    "0 4px 24px rgba(0,0,0,0.35)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.50)",
      },

      // ─── Keyframes ────────────────────────────────────────────────────────
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-8px) rotate(1deg)" },
          "66%":      { transform: "translateY(-4px) rotate(-1deg)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "1" },
        },
        "grid-move": {
          "0%":   { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        "border-beam": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },

      // ─── Animations ───────────────────────────────────────────────────────
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "float":          "float 6s ease-in-out infinite",
        "float-slow":     "float-slow 9s ease-in-out infinite",
        "shimmer":        "shimmer 3s linear infinite",
        "pulse-glow":     "pulse-glow 3s ease-in-out infinite",
        "grid-move":      "grid-move 8s linear infinite",
        "border-beam":    "border-beam 4s ease infinite",
        "fade-up":        "fade-up 0.7s ease-out forwards",
        "fade-in":        "fade-in 0.6s ease-out forwards",
        "scale-in":       "scale-in 0.5s ease-out forwards",
      },

      // ─── Backdrop blur ────────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
