/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.{ejs,html,js}',
    './public/javascripts/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
};
