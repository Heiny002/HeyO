/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF5757',
          DEFAULT: '#FF0000',
          dark: '#CC0000',
        },
        secondary: {
          light: '#5785FF',
          DEFAULT: '#0055FF',
          dark: '#0044CC',
        },
        accent: {
          light: '#FFDD57',
          DEFAULT: '#FFCC00',
          dark: '#CCAA00',
        },
        success: {
          light: '#57FF5E',
          DEFAULT: '#00CC00',
          dark: '#009900',
        },
        background: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Nunito', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
    },
  },
  plugins: [],
} 