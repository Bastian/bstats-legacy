const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./routes/**/*.js",
    "./app.js",
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.emerald,
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        floating: "0 30px 80px -30px rgba(16, 185, 129, 0.45)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
