const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        success: '#3fb950',
        warning: '#d29922', 
        danger: '#f85149',
        primary: '#d0bcff',
        secondary: '#4cd7f6',
        tertiary: '#adc6ff',
        onprimary: '#3c0091',
        onsecondary: '#003640',
        ontertiary: '#002e6a',
        surface: '#131318',
        'on-surface': '#e4e1e9',
        'on-surface-variant': '#c7c4d7',
        'surface-container-low': '#1b1b20',
        'surface-container-highest': '#35343a',
        'surface-container-high': '#2a292f',
        'surface-container-lowest': '#0e0e13',
        'outline-variant': '#464554',
        'primary-container': '#a078ff',
        'secondary-container': '#03b5d3',
        'tertiary-container': '#4d8eff',
        'text-muted': '#8a8f98',
        'surface-highlight': '#1e2025',
        border: '#27282d',
        background: '#0b0c0e',
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
