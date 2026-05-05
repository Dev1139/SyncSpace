/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        void: "rgb(var(--color-void) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surface2: "rgb(var(--color-surface-2) / <alpha-value>)",
        surface3: "rgb(var(--color-surface-3) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",

        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",

        border: "rgb(var(--color-border) / <alpha-value>)",
        border2: "rgb(var(--color-border-2) / <alpha-value>)",

        primary: "rgb(var(--color-primary) / <alpha-value>)",
        primarySoft: "rgb(var(--color-primary-soft) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",

        hover: "rgb(var(--color-hover) / <alpha-value>)",
      },

      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
      },

      maxWidth: {
        content: "840px",
      },

      boxShadow: {
        panel: "var(--shadow-panel)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
