/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Satoshi", "Inter", "sans-serif"],
    },
    extend: {
      colors: {
        gradientFrom: "#3F2E27",
        gradientTo: "#0E1117",
        blue: {
          10: "#151520",
          24: "#363E45",
        },
        textWhite: "#e6e6e6",
        textActive: "#eb7b47",
        textPrimary: "#ffb999",
        buttonOrangeHover: "#5B3320",
        buttonOrange: "#884C30",
      },
    },
  },
  plugins: [],
};