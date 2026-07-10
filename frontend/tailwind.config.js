/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "var(--container-padding)",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        heading: ["var(--font-heading)"],
      },
      colors: {
        /* Neutrals / surface system */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted: "hsl(var(--foreground-muted))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          tint: "hsl(var(--surface-tint))",
          variant: "hsl(var(--surface-variant))",
          "container-lowest": "hsl(var(--surface-container-lowest))",
          "container-low": "hsl(var(--surface-container-low))",
          DEFAULT: "hsl(var(--surface-container))",
          "container-high": "hsl(var(--surface-container-high))",
          "container-highest": "hsl(var(--surface-container-highest))",
        },
        "inverse-surface": "hsl(var(--inverse-surface))",
        "inverse-on-surface": "hsl(var(--inverse-on-surface))",
        "inverse-primary": "hsl(var(--inverse-primary))",

        /* Foreground surfaces */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          shadow: "hsl(var(--card-shadow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        /* Primary */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
          container: "hsl(var(--primary-container))",
          "on-container": "hsl(var(--on-primary-container))",
          fixed: "hsl(var(--primary-fixed))",
          "fixed-dim": "hsl(var(--primary-fixed-dim))",
          "on-fixed": "hsl(var(--on-primary-fixed))",
          "on-fixed-variant": "hsl(var(--on-primary-fixed-variant))",
        },

        /* Secondary */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          container: "hsl(var(--secondary-container))",
          "on-container": "hsl(var(--on-secondary-container))",
          fixed: "hsl(var(--secondary-fixed))",
          "fixed-dim": "hsl(var(--secondary-fixed-dim))",
          "on-fixed": "hsl(var(--on-secondary-fixed))",
          "on-fixed-variant": "hsl(var(--on-secondary-fixed-variant))",
        },

        /* Tertiary */
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          container: "hsl(var(--tertiary-container))",
          "on-container": "hsl(var(--on-tertiary-container))",
          fixed: "hsl(var(--tertiary-fixed))",
          "fixed-dim": "hsl(var(--tertiary-fixed-dim))",
          "on-fixed": "hsl(var(--on-tertiary-fixed))",
          "on-fixed-variant": "hsl(var(--on-tertiary-fixed-variant))",
        },

        /* Functional status */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          container: "hsl(var(--success-container))",
          "container-foreground": "hsl(var(--success-foreground-dark))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          container: "hsl(var(--warning-container))",
          "container-foreground": "hsl(var(--warning-foreground-dark))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          container: "hsl(var(--info-container))",
          "container-foreground": "hsl(var(--info-foreground-dark))",
        },

        /* Error / destructive */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          container: "hsl(var(--destructive-container))",
          "on-container": "hsl(var(--on-destructive-container))",
        },

        /* Muted / accent (active state per DESIGN.md #DEEBFF) */
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        /* Sidebar */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-background": "var(--gradient-background)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        "custom-sm": "var(--shadow-sm)",
        "custom-md": "var(--shadow-md)",
        "custom-lg": "var(--shadow-lg)",
        overlay: "var(--shadow-overlay)",
        glow: "var(--shadow-glow)",
      },
      transitionProperty: {
        smooth: "var(--transition-smooth)",
        bounce: "var(--transition-bounce)",
      },
      /* DESIGN.md `rounded` scale. Note DEFAULT radius = 0.25rem (= --radius). */
      borderRadius: {
        none: "0px",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "calc(var(--radius-xl) + 0.25rem)",
        "3xl": "calc(var(--radius-xl) + 0.5rem)",
        full: "var(--radius-full)",
      },
      /* DESIGN.md `spacing` — base 4px rhythm + density row heights */
      spacing: {
        unit: "var(--spacing-unit)",
        gutter: "var(--gutter)",
        "container-padding": "var(--container-padding)",
        "row-dense": "var(--row-height-dense)",
        "row-standard": "var(--row-height-standard)",
      },
      /* Placeholder opacity (DESIGN.md Input Fields) — sourced from
         --placeholder-opacity in index.css so the `placeholder:opacity-70`
         utility and the base-layer ::placeholder rule stay in sync. */
      opacity: {
        70: "var(--placeholder-opacity)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};