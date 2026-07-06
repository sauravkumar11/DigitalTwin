/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        twin: {
          bg: "#0b1220",
          panel: "#111a2e",
          accent: "#3ddcff",
          healthy: "#22c55e",
          monitor: "#eab308",
          critical: "#ef4444",
        },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
