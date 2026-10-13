/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'be-vietnam': ['"Be Vietnam Pro"', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'merriweather': ['Merriweather', 'serif'],
        'playfair': ['"Playfair Display"', 'serif'],
        'noto-serif': ['"Noto Serif"', 'serif'],
        'times': ['"Times New Roman"', 'Times', 'serif'],
        'arial': ['Arial', 'Helvetica', 'sans-serif'],
        'calibri': ['Calibri', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
