/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9d4a3d',
        'primary-hover': '#8a3e31',
        secondary: '#296a56',
        'text-primary': '#301713',
        'bg-warm': '#f5f1ed',
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'serif'],
        'sans': ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
