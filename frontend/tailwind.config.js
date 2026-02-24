/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 
          50: '#edf9fa',
          100: '#d0f0f2',
          200: '#a7e4e8',
          300: '#72d3d9',
          400: '#3ebfc7',
          500: '#1fa8b1',
          600: '#138b93', // Your base color slightly adjusted for the 600 slot
          700: '#136a70', // Your original base color fits well here
          800: '#15585d',
          900: '#164a4e',
          950: '#0b2f33',
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography'),],
};
