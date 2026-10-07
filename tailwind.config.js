/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F2F6FC',
          100: '#E1EAF7',
          200: '#C2D5EE',
          300: '#96B7DF',
          400: '#6392CB',
          500: '#3E72B2',
          600: '#2C5A94',
          700: '#234877',
          800: '#1D3A60',
          900: '#152C4C',
          950: '#0B1B33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 27 51 / 0.05), 0 8px 24px rgb(11 27 51 / 0.07)',
        'soft-lg': '0 2px 4px rgb(11 27 51 / 0.05), 0 16px 48px rgb(11 27 51 / 0.12)',
        glow: '0 0 0 1px rgb(16 185 129 / 0.2), 0 8px 32px rgb(16 185 129 / 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
