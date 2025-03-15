/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF9D9D',
          DEFAULT: '#FF5C5C',
          dark: '#E53E3E',
        },
        secondary: {
          light: '#9DFFFF',
          DEFAULT: '#5CE1FF',
          dark: '#3EB8E5',
        },
        accent: {
          light: '#FFD79D',
          DEFAULT: '#FFBB5C',
          dark: '#E59C3E',
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
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
} 