/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        offWhite: "#fafafa",
        blueHighlight: "#3b74aa",
        listBlue: "#2b3467"
      },
      fontFamily: {
        opensans: ['OpenSans', 'sans-serif'],
        novaSquare: ['NovaSquare', 'cursive']
      }
    },
  },
  plugins: [],
}
