/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        topic: 'clamp(3rem, 10vw, 8rem)',
      },
      colors: {
        success: '#52b788',
        error: '#e63946',
      },
      animation: {
        blink: 'blink 1s infinite',
        slideIn: 'slideIn 0.2s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.3' },
        },
        slideIn: {
          from: {
            transform: 'translateX(-50%) scaleX(0.8)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(-50%) scaleX(1)',
            opacity: '1',
          },
        },
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
