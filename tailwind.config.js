const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
   corePlugins: {
    preflight: false,
  }, 
  important: true,
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [],
  theme: {
    extend: {
      screens: {
        'print': {'raw': 'print'}
      },
      colors: {
        primary: colors.sky,
        secondary: colors.pink,
      },
    },
  },
  plugins: [],
}