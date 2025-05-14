import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        background: "#ECEFF1",
        sidebar: "#0D47A1", // Azul Periodístico (antes verde WhatsApp)
        card: "#ffffff",
        whatsapp: {
          DEFAULT: "#1976D2", // Azul Editorial (antes verde WhatsApp)
          dark: "#0D47A1", // Azul Periodístico (antes verde oscuro)
          light: "#F5F7FA", // Gris Papel (antes verde claro)
          teal: "#002D62", // Azul Marino (antes verde azulado)
        },
        accent: {
          DEFAULT: "#607D8B", // Gris Pluma (antes azul WhatsApp)
          light: "#E1F5FE",
        },
        yellow: {
          DEFAULT: "#FFC107", // Dorado Destacado (se mantiene)
          light: "#FFF8E1",
        },
        coral: {
          DEFAULT: "#D32F2F", // Rojo Editorial (antes coral)
          light: "#FFCCCB",
        },
        green: {
          DEFAULT: "#1976D2", // Azul Editorial (antes verde)
        },
        navy: {
          DEFAULT: "#002D62", // Azul Marino (antes verde azulado)
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
