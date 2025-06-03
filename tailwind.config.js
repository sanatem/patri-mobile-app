/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF1E6',
          100: '#FFE0CC',
          200: '#FFC199',
          300: '#FFA266',
          400: '#FF8333',
          500: '#FF6503',
          600: '#CC5002',
          700: '#993C02',
          800: '#662801',
          900: '#331400',
        },
        secondary: {
          50: '#EAE9E8',
          100: '#D5D3D1',
          200: '#ABA7A3',
          300: '#817B75',
          400: '#574F47',
          500: '#1F1A17',
          600: '#191513',
          700: '#130F0E',
          800: '#0C0A0A',
          900: '#060505',
        },
      },
      fontFamily: {
          sans: ['Poppins-Regular'],
          regular: ['Poppins-Regular'],
          medium: ['Poppins-Medium'],
          semibold: ['Poppins-SemiBold'],
          bold: ['Poppins-Bold'],
        },
    },
  },
  plugins: [],
}