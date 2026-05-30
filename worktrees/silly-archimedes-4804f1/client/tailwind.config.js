/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f6',
          100: '#fbe4ec',
          200: '#f5c0d4',
          300: '#ec90af',
          400: '#df628d',
          500: '#993355',
          600: '#7a2845',
          700: '#660033',
          800: '#4d0026',
          900: '#330019',
        },
        ink: '#2d2d2d',
        cream: '#fafafa',
        paper: '#f0f0f0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(102, 0, 51, 0.18)',
        card: '0 10px 30px -15px rgba(45, 45, 45, 0.18)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
